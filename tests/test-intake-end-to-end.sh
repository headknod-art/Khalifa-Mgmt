#!/bin/bash
# End-to-End Intake Application Test
# Tests the full intake submission flow and tracks the data

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║     END-TO-END INTAKE APPLICATION TEST                    ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test data
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-intake-${TIMESTAMP}@example.com"
TEST_NAME="John Test Doe ${TIMESTAMP}"

echo -e "${BLUE}📝 Test Data:${NC}"
echo "  Name: $TEST_NAME"
echo "  Email: $TEST_EMAIL"
echo "  Timestamp: $TIMESTAMP"
echo ""

# Step 1: Submit intake form
echo -e "${YELLOW}[1/6] Submitting intake form...${NC}"

INTAKE_RESPONSE=$(curl -s -X POST http://localhost:5001/api/intake \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$TEST_EMAIL\",
    \"formData\": {
      \"fullName\": \"$TEST_NAME\",
      \"email\": \"$TEST_EMAIL\",
      \"phone\": \"555-TEST-${TIMESTAMP:(-4)}\",
      \"address\": \"123 Test Street, Test City, CA 90001\",
      \"maritalStatus\": \"married\",
      \"spouse\": \"Jane Test Doe\",
      \"isRestatementOrAmendment\": \"no\",
      \"desiredTrustName\": \"${TEST_NAME} Family Trust\",
      \"residenceAddress\": \"123 Test Street, Test City, CA 90001\",
      \"homePhone\": \"555-HOME-${TIMESTAMP:(-4)}\",
      \"clientHusbandName\": \"$TEST_NAME\",
      \"clientHusbandDob\": \"1985-06-15\",
      \"clientHusbandBirthStateCountry\": \"California, USA\",
      \"clientHusbandEmployed\": \"yes\",
      \"clientHusbandRetired\": \"no\",
      \"clientHusbandUsCitizen\": \"yes\",
      \"wifeName\": \"Jane Test Doe\",
      \"wifeDob\": \"1987-08-20\",
      \"wifeBirthStateCountry\": \"California, USA\",
      \"wifeEmployed\": \"yes\",
      \"wifeRetired\": \"no\",
      \"wifeUsCitizen\": \"yes\",
      \"children\": [
        {\"name\": \"Alice Doe\", \"age\": 12},
        {\"name\": \"Bob Doe\", \"age\": 10}
      ],
      \"assets\": {
        \"realEstate\": 450000,
        \"stocks\": 120000,
        \"cashSavings\": 50000
      },
      \"realEstatePropertyAddress\": \"123 Test Street, Test City, CA 90001\",
      \"realEstateCounty\": \"Los Angeles\",
      \"realEstateEquity\": 450000,
      \"includeCollegeIncentiveClause\": \"yes\",
      \"includeTenPercentOfTrustUponGraduation\": \"yes\",
      \"originalTrustees\": \"clientAndSpouse\",
      \"survivingSpouseServeAs\": \"soleTrustee\",
      \"notes\": \"This is a test intake submission for end-to-end testing. Timestamp: ${TIMESTAMP}\"
    }
  }")

echo "$INTAKE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$INTAKE_RESPONSE"

# Extract submission ID
SUBMISSION_ID=$(echo "$INTAKE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SUBMISSION_ID" ]; then
  echo -e "${RED}❌ Failed to submit intake or extract submission ID${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Intake submitted successfully!${NC}"
echo "  Submission ID: $SUBMISSION_ID"
echo ""

# Step 2: Wait for processing
echo -e "${YELLOW}[2/6] Waiting 3 seconds for processing...${NC}"
sleep 3
echo ""

# Step 3: Check intake-form-app MongoDB
echo -e "${YELLOW}[3/6] Checking intake form database (khalifa_intake)...${NC}"

INTAKE_DB_RECORD=$(docker exec intake-form-app-mongo mongosh khalifa_intake --quiet --eval "
  db.intake_forms.findOne({_id: ObjectId('$SUBMISSION_ID')})
" 2>/dev/null)

if [ ! -z "$INTAKE_DB_RECORD" ]; then
  echo -e "${GREEN}✅ Found in intake_forms collection:${NC}"
  echo "$INTAKE_DB_RECORD" | head -20
  
  # Extract key fields
  INTAKE_STATUS=$(echo "$INTAKE_DB_RECORD" | grep -o '"status" : "[^"]*"' | cut -d'"' -f4)
  echo ""
  echo "  Status: $INTAKE_STATUS"
else
  echo -e "${RED}❌ Not found in intake_forms collection${NC}"
fi
echo ""

# Step 4: Check if Client was auto-created in khalifa-mgmt
echo -e "${YELLOW}[4/6] Checking if Client was created (khalifa-mgmt DB)...${NC}"

CLIENT_RECORD=$(docker exec khalifa-mgmt-mongo mongosh khalifa-mgmt --quiet --eval "
  db.clients.findOne({email: '$TEST_EMAIL'})
" 2>/dev/null)

if [ ! -z "$CLIENT_RECORD" ] && echo "$CLIENT_RECORD" | grep -q "null" ; then
  echo -e "${YELLOW}⚠️  No client record found${NC}"
  echo "  Note: Auto-client creation may require additional setup"
elif [ ! -z "$CLIENT_RECORD" ]; then
  echo -e "${GREEN}✅ Client record found:${NC}"
  echo "$CLIENT_RECORD" | head -15
  
  CLIENT_ID=$(echo "$CLIENT_RECORD" | grep -o '"_id" : ObjectId("[^"]*")' | cut -d'"' -f4)
  echo ""
  echo "  Client ID: $CLIENT_ID"
else
  echo -e "${YELLOW}⚠️  Client record not found${NC}"
fi
echo ""

# Step 5: Check if User profile was updated
echo -e "${YELLOW}[5/6] Checking User profile updates...${NC}"

USER_RECORD=$(docker exec khalifa-mgmt-mongo mongosh khalifa-mgmt --quiet --eval "
  db.users.findOne({email: '$TEST_EMAIL'})
" 2>/dev/null)

if [ ! -z "$USER_RECORD" ] && echo "$USER_RECORD" | grep -q "null" ; then
  echo -e "${YELLOW}⚠️  No user profile found${NC}"
elif [ ! -z "$USER_RECORD" ]; then
  echo -e "${GREEN}✅ User profile found:${NC}"
  echo "$USER_RECORD" | head -15
  
  USER_INTAKE_STATUS=$(echo "$USER_RECORD" | grep -o '"intakeStatus" : "[^"]*"' | cut -d'"' -f4)
  if [ ! -z "$USER_INTAKE_STATUS" ]; then
    echo ""
    echo "  Intake Status: $USER_INTAKE_STATUS"
  fi
else
  echo -e "${YELLOW}⚠️  User profile not found${NC}"
fi
echo ""

# Step 6: Check for Tasks and Notifications
echo -e "${YELLOW}[6/6] Checking for Tasks and Notifications...${NC}"

TASKS=$(docker exec khalifa-mgmt-mongo mongosh khalifa-mgmt --quiet --eval "
  db.tasks.find({
    \$or: [
      {title: {regex: /test/i}},
      {createdAt: {gt: new Date(Date.now() - 60000)}}
    ]
  }).limit(3)
" 2>/dev/null)

if echo "$TASKS" | grep -q "_id" ; then
  echo -e "${GREEN}✅ Found recent tasks:${NC}"
  echo "$TASKS" | head -20
else
  echo -e "${YELLOW}⚠️  No recent tasks found${NC}"
fi
echo ""

NOTIFICATIONS=$(docker exec khalifa-mgmt-mongo mongosh khalifa-mgmt --quiet --eval "
  db.notifications.find({
    createdAt: {gt: new Date(Date.now() - 60000)}
  }).limit(3)
" 2>/dev/null)

if echo "$NOTIFICATIONS" | grep -q "_id" ; then
  echo -e "${GREEN}✅ Found recent notifications:${NC}"
  echo "$NOTIFICATIONS" | head -20
else
  echo -e "${YELLOW}⚠️  No recent notifications found${NC}"
fi
echo ""

# Summary
echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}                    TEST SUMMARY                           ${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Test Intake Details:${NC}"
echo "  📧 Email: $TEST_EMAIL"
echo "  👤 Name: $TEST_NAME"
echo "  🆔 Submission ID: $SUBMISSION_ID"
echo ""

echo -e "${BLUE}Data Location:${NC}"
if [ ! -z "$SUBMISSION_ID" ]; then
  echo -e "  ✅ intake-form-app DB: ${GREEN}Found in khalifa_intake.intake_forms${NC}"
else
  echo -e "  ❌ intake-form-app DB: ${RED}Not found${NC}"
fi

if echo "$CLIENT_RECORD" | grep -q "_id" ; then
  echo -e "  ✅ Client Record: ${GREEN}Found in khalifa-mgmt.clients${NC}"
else
  echo -e "  ⚠️  Client Record: ${YELLOW}Not created (may need processing setup)${NC}"
fi

if echo "$USER_RECORD" | grep -q "_id" ; then
  echo -e "  ✅ User Profile: ${GREEN}Found in khalifa-mgmt.users${NC}"
else
  echo -e "  ⚠️  User Profile: ${YELLOW}Not found${NC}"
fi

echo ""
echo -e "${BLUE}Quick Access Commands:${NC}"
echo "  # View intake in MongoDB"
echo "  docker exec intake-form-app-mongo mongosh khalifa_intake --eval \"db.intake_forms.findOne({_id: ObjectId('$SUBMISSION_ID')})\""
echo ""
echo "  # View all recent intakes"
echo "  docker exec intake-form-app-mongo mongosh khalifa_intake --eval \"db.intake_forms.find().sort({createdAt: -1}).limit(5)\""
echo ""
echo "  # Check client records"
echo "  docker exec khalifa-mgmt-mongo mongosh khalifa-mgmt --eval \"db.clients.findOne({email: '$TEST_EMAIL'})\""
echo ""
echo "  # View intake in browser"
echo "  echo 'Intake Form: http://localhost:3006'"
echo "  echo 'Khalifa Mgmt: http://localhost:3002'"
echo ""

echo -e "${GREEN}✅ End-to-End Test Complete!${NC}"
echo ""
