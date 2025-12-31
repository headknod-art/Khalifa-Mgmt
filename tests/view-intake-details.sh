#!/bin/bash
# View Complete Intake Details
# Shows the full intake submission with all data

if [ -z "$1" ]; then
  echo "Usage: $0 <submission_id>"
  echo ""
  echo "Example: $0 695305bd8cf02882a48571bf"
  echo ""
  echo "Get recent submission IDs:"
  docker exec intake-form-app-mongo mongosh khalifa_intake --quiet --eval "db.intake_forms.find().sort({createdAt: -1}).limit(5).forEach(doc => print('ID: ' + doc._id + ' | Email: ' + doc.userId + ' | Date: ' + doc.createdAt))"
  exit 1
fi

SUBMISSION_ID=$1

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║         INTAKE SUBMISSION DETAILS                         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Submission ID: $SUBMISSION_ID"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 COMPLETE INTAKE FORM DATA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

docker exec intake-form-app-mongo mongosh khalifa_intake --quiet --eval "
  const doc = db.intake_forms.findOne({_id: ObjectId('$SUBMISSION_ID')});
  if (!doc) {
    print('❌ Submission not found');
  } else {
    print('');
    print('📧 Contact Information:');
    print('  User ID: ' + doc.userId);
    print('  Full Name: ' + (doc.formData.fullName || 'N/A'));
    print('  Email: ' + (doc.formData.email || 'N/A'));
    print('  Phone: ' + (doc.formData.phone || 'N/A'));
    print('  Home Phone: ' + (doc.formData.homePhone || 'N/A'));
    print('  Address: ' + (doc.formData.address || 'N/A'));
    print('');
    print('🏠 Trust Information:');
    print('  Trust Name: ' + (doc.formData.desiredTrustName || 'N/A'));
    print('  Restatement/Amendment: ' + (doc.formData.isRestatementOrAmendment || 'N/A'));
    print('  Residence: ' + (doc.formData.residenceAddress || 'N/A'));
    print('');
    print('👨 Client/Husband Information:');
    print('  Name: ' + (doc.formData.clientHusbandName || 'N/A'));
    print('  DOB: ' + (doc.formData.clientHusbandDob || 'N/A'));
    print('  Birth Place: ' + (doc.formData.clientHusbandBirthStateCountry || 'N/A'));
    print('  Employed: ' + (doc.formData.clientHusbandEmployed || 'N/A'));
    print('  Retired: ' + (doc.formData.clientHusbandRetired || 'N/A'));
    print('  US Citizen: ' + (doc.formData.clientHusbandUsCitizen || 'N/A'));
    print('');
    print('👩 Wife Information:');
    print('  Name: ' + (doc.formData.wifeName || 'N/A'));
    print('  DOB: ' + (doc.formData.wifeDob || 'N/A'));
    print('  Birth Place: ' + (doc.formData.wifeBirthStateCountry || 'N/A'));
    print('  Employed: ' + (doc.formData.wifeEmployed || 'N/A'));
    print('  Retired: ' + (doc.formData.wifeRetired || 'N/A'));
    print('  US Citizen: ' + (doc.formData.wifeUsCitizen || 'N/A'));
    print('');
    print('💰 Financial Information:');
    if (doc.formData.assets) {
      print('  Real Estate: \$' + (doc.formData.assets.realEstate || 0).toLocaleString());
      print('  Stocks: \$' + (doc.formData.assets.stocks || 0).toLocaleString());
      print('  Cash Savings: \$' + (doc.formData.assets.cashSavings || 0).toLocaleString());
      const total = (doc.formData.assets.realEstate || 0) + (doc.formData.assets.stocks || 0) + (doc.formData.assets.cashSavings || 0);
      print('  Total Assets: \$' + total.toLocaleString());
    } else {
      print('  No asset information provided');
    }
    print('');
    print('🏡 Real Estate Details:');
    print('  Property: ' + (doc.formData.realEstatePropertyAddress || 'N/A'));
    print('  County: ' + (doc.formData.realEstateCounty || 'N/A'));
    print('  Equity: \$' + ((doc.formData.realEstateEquity || 0).toLocaleString()));
    print('');
    print('👨‍👩‍👧‍👦 Family Information:');
    print('  Marital Status: ' + (doc.formData.maritalStatus || 'N/A'));
    print('  Spouse: ' + (doc.formData.spouse || 'N/A'));
    if (doc.formData.children && doc.formData.children.length > 0) {
      print('  Children: ' + doc.formData.children.length);
      doc.formData.children.forEach((child, i) => {
        print('    ' + (i+1) + '. ' + child.name + ' (Age: ' + child.age + ')');
      });
    }
    print('');
    print('⚖️ Trust Provisions:');
    print('  College Incentive: ' + (doc.formData.includeCollegeIncentiveClause || 'N/A'));
    print('  10% Upon Graduation: ' + (doc.formData.includeTenPercentOfTrustUponGraduation || 'N/A'));
    print('  Original Trustees: ' + (doc.formData.originalTrustees || 'N/A'));
    print('  Surviving Spouse Role: ' + (doc.formData.survivingSpouseServeAs || 'N/A'));
    print('');
    print('📝 Additional Notes:');
    print('  ' + (doc.formData.notes || 'None'));
    print('');
    print('📊 Metadata:');
    print('  Status: ' + (doc.status || 'N/A'));
    print('  Client ID: ' + (doc.clientId || 'Not linked'));
    print('  Submitted: ' + doc.createdAt);
    print('  Updated: ' + doc.updatedAt);
    print('');
  }
"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 RAW JSON DATA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

docker exec intake-form-app-mongo mongosh khalifa_intake --quiet --eval "
  db.intake_forms.findOne({_id: ObjectId('$SUBMISSION_ID')})
" | head -100

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ View complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
