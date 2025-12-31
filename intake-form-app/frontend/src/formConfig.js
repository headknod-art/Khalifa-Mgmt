const formConfig = [
    {
        sectionTitle: "Trust Type & Name",
        fields: [
            {
                name: "isRestatementOrAmendment",
                label: "Is this a restatement or an amendment of a prior Trust?",
                type: "radio",
                options: [
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes - If Yes, you MUST provide a copy of the original trust with this application." }
                ],
            },
            {
                name: "dateOfOriginalTrust",
                label: "Date of Original Trust",
                type: "date",
                dependency: {
                    field: "isRestatementOrAmendment",
                    value: "yes"
                }
            },
            {
                name: "desiredTrustName",
                label: "Desired Trust Name",
                type: "text",
            },
        ]
    },
    {
        sectionTitle: "Client's Residence",
        fields: [
            {
                name: "residenceAddress",
                label: "Residence Address (Street, City, State & Zip)",
                type: "text",
            },
            {
                name: "homePhone",
                label: "Home Phone",
                type: "tel",
            },
        ]
    },
    {
        sectionTitle: "Client/Husband's Information",
        fields: [
            {
                name: "clientHusbandName",
                label: "Name as you sign legal documents (please print)",
                type: "text",
            },
            {
                name: "clientHusbandDob",
                label: "Date of Birth",
                type: "date",
            },
            {
                name: "clientHusbandBirthStateCountry",
                label: "Birth State or Country",
                type: "text",
            },
            {
                name: "clientHusbandSsn",
                label: "SSN (optional)",
                type: "text",
            },
            {
                name: "clientHusbandEmployed",
                label: "Employed?",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ],
            },
            {
                name: "clientHusbandRetired",
                label: "Retired?",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ],
            },
            {
                name: "clientHusbandUsCitizen",
                label: "US Citizen?",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ],
            },
            {
                name: "clientHusbandGender",
                label: "Gender",
                type: "radio",
                options: [
                    { value: "M", label: "M" },
                    { value: "F", label: "F" }
                ],
            },
        ]
    },
    {
        sectionTitle: "Marriage Information",
        fields: [
            {
                name: "maritalStatus",
                label: "Marital Status",
                type: "radio",
                options: [
                    { value: "married", label: "Married" },
                    { value: "neverMarried", label: "Never Married" },
                    { value: "widowed", label: "Widowed" },
                    { value: "divorced", label: "Divorced" }
                ],
            },
            {
                name: "formerSpouseName",
                label: "If widowed or divorce give former spouse's name",
                type: "text",
                dependency: {
                    field: "maritalStatus",
                    values: ["widowed", "divorced"]
                }
            },
        ]
    },
    {
        sectionTitle: "Wife's Information",
        fields: [
            {
                name: "wifeName",
                label: "Name as you sign legal documents (please print)",
                type: "text",
            },
            {
                name: "wifeDob",
                label: "Date of Birth",
                type: "date",
            },
            {
                name: "wifeBirthStateCountry",
                label: "Birth State or Country",
                type: "text",
            },
            {
                name: "wifeSsn",
                label: "SSN (optional)",
                type: "text",
            },
            {
                name: "wifeEmployed",
                label: "Employed?",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ],
            },
            {
                name: "wifeRetired",
                label: "Retired?",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ],
            },
            {
                name: "wifeUsCitizen",
                label: "US Citizen?",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ],
            },
            {
                name: "wifeGender",
                label: "Gender",
                type: "radio",
                options: [
                    { value: "M", label: "M" },
                    { value: "F", label: "F" }
                ],
            },
        ]
    },
    {
        sectionTitle: "Children",
        repeatable: true,
        maxInstances: 4, // From the PDF, it has 4 numbered child sections
        fields: [
            {
                name: "childName",
                label: "Name",
                type: "text",
            },
            {
                name: "childAddress",
                label: "Address",
                type: "text",
            },
            {
                name: "childParent",
                label: "Parent",
                type: "radio",
                options: [
                    { value: "SB", label: "S/B" },
                    { value: "H", label: "H" },
                    { value: "W", label: "W" }
                ],
            },
            {
                name: "childSonDaughter",
                label: "Check one:",
                type: "radio",
                options: [
                    { value: "son", label: "Son" },
                    { value: "daughter", label: "Daughter" }
                ],
            },
            {
                name: "childLiving",
                label: "Living",
                type: "radio",
                options: [
                    { value: "yes", label: "Y" },
                    { value: "no", label: "N" }
                ],
            },
            {
                name: "childDob",
                label: "Date of Birth",
                type: "date",
            },
            {
                name: "childDod",
                label: "Date of Death",
                type: "date",
                dependency: {
                    field: "childLiving",
                    value: "no"
                }
            },
            {
                name: "childHasIssue",
                label: "Has Issue",
                type: "radio",
                options: [
                    { value: "yes", label: "Y" },
                    { value: "no", label: "N" }
                ],
                dependency: {
                    field: "childLiving",
                    value: "no"
                }
            },
            {
                name: "childDistribution",
                label: "Distribute",
                type: "radio",
                options: [
                    { value: "noneOutright", label: "None Outright" },
                    { value: "atAge", label: "At Age" }
                ],
                dependency: {
                    field: "childLiving",
                    value: "no"
                }
            },
            {
                name: "childDistributionAge",
                label: "At Age",
                type: "number",
                dependency: {
                    field: "childDistribution",
                    value: "atAge"
                }
            },
            {
                name: "childIfNotFoundIssue",
                label: "If not living: to issue to remaining named beneficiaries",
                type: "text",
                dependency: {
                    field: "childLiving",
                    value: "no"
                }
            },
            {
                name: "childPercentageOfEstate",
                label: "% of Estate (if any):",
                type: "number",
                dependency: {
                    field: "childLiving",
                    value: "no"
                }
            },
        ]
    },
    {
        sectionTitle: "Other (non-children) Beneficiaries",
        repeatable: true,
        maxInstances: 3, // From the PDF, it has 3 numbered other beneficiary sections
        fields: [
            {
                name: "otherBeneficiaryName",
                label: "Name",
                type: "text",
            },
            {
                name: "otherBeneficiaryAddress",
                label: "Address",
                type: "text",
            },
            {
                name: "otherBeneficiaryRelatedTo",
                label: "Related to:",
                type: "radio",
                options: [
                    { value: "SB", label: "S/B" },
                    { value: "H", label: "H" },
                    { value: "W", label: "W" }
                ],
            },
            {
                name: "otherBeneficiarySex",
                label: "Sex:",
                type: "radio",
                options: [
                    { value: "M", label: "M" },
                    { value: "F", label: "F" }
                ],
            },
            {
                name: "otherBeneficiaryRelationship",
                label: "Relationship",
                type: "text",
            },
            {
                name: "otherBeneficiaryDistribution",
                label: "Distribute:",
                type: "radio",
                options: [
                    { value: "noneOutright", label: "None Outright" },
                    { value: "atAge", label: "Age(s)" }
                ],
            },
            {
                name: "otherBeneficiaryDistributionAge",
                label: "Age(s)",
                type: "number",
                dependency: {
                    field: "otherBeneficiaryDistribution",
                    value: "atAge"
                }
            },
            {
                name: "otherBeneficiaryIfNotFoundIssue",
                label: "If not living: to issue to remaining named beneficiaries",
                type: "text",
            },
            {
                name: "otherBeneficiaryPercentageOfEstate",
                label: "% of Estate (if any):",
                type: "number",
            },
        ]
    },
    {
        sectionTitle: "Distribution",
        fields: [
            {
                name: "includeCollegeIncentiveClause",
                label: "Include College Incentive Clause:",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ],
            },
            {
                name: "includeTenPercentOfTrustUponGraduation",
                label: "Include 10% of Trust upon graduation:",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ],
                dependency: {
                    field: "includeCollegeIncentiveClause",
                    value: "yes"
                }
            },
            {
                name: "distributionNotes",
                label: "Distribution Notes:",
                type: "textarea",
            },
        ]
    },
    {
        sectionTitle: "Gifts",
        repeatable: true,
        maxInstances: 2, // From the PDF, it has 2 numbered gift sections
        fields: [
            {
                name: "giftTo",
                label: "To:",
                type: "text",
            },
            {
                name: "giftAddress",
                label: "Address (if not previously provided):",
                type: "text",
            },
            {
                name: "giftRelationship",
                label: "Relationship:",
                type: "text",
            },
            {
                name: "giftUnableToReceive",
                label: "If unable to receive, gift will:",
                type: "radio",
                options: [
                    { value: "lapse", label: "Lapse" },
                    { value: "goToIssue", label: "go to Issue" },
                    { value: "goToOther", label: "go to other (describe)" }
                ],
            },
            {
                name: "giftUnableToReceiveOther",
                label: "Describe other:",
                type: "text",
                dependency: {
                    field: "giftUnableToReceive",
                    value: "goToOther"
                }
            },
            {
                name: "giftDistributeAtDeathOf",
                label: "Distribute at death of:",
                type: "radio",
                options: [
                    { value: "singleOrBothSettlors", label: "Single or Both Settlors" },
                    { value: "husband", label: "Husband" },
                    { value: "wife", label: "Wife" }
                ],
            },
            {
                name: "giftDescription",
                label: "Gift Description:",
                type: "textarea",
            },
        ]
    },
    {
        sectionTitle: "Family Disaster Clause",
        fields: [
            {
                name: "contingentBeneficiaryFullNameAddress",
                label: "Full Name and Address:",
                type: "textarea",
                description: "List contingent beneficiary(ies) who will receive distribution in the event that ALL named beneficiaries are deceased."
            },
        ]
    },
    {
        sectionTitle: "Disinheritance",
        fields: [
            {
                name: "disinheritedPersonsFullNameAddress",
                label: "Full Name and Address:",
                type: "textarea",
                description: "Persons natural heirs who will be intentionally excluded (disinherited) from distribution of the Estate."
            },
        ]
    },
    {
        sectionTitle: "Initial Trustees",
        fields: [
            {
                name: "originalTrustees",
                label: "Original Trustees of the Trust will be:",
                type: "checkbox",
                options: [
                    { value: "clientAndSpouse", label: "Client (and Spouse if Married)" },
                    { value: "husbandOnly", label: "Husband only" },
                    { value: "wifeOnly", label: "Wife only" },
                    { value: "other", label: "Other" }
                ],
            },
            {
                name: "originalTrusteesOther",
                label: "Other:",
                type: "text",
                dependency: {
                    field: "originalTrustees",
                    value: "other"
                }
            },
            {
                name: "survivingSpouseServeAs",
                label: "Surviving Spouse will serve as:",
                type: "radio",
                options: [
                    { value: "soleTrustee", label: "Sole Trustee" },
                    { value: "jointTrusteeWithSuccessor", label: "Joint Trustee with Successor" }
                ],
            },
        ]
    },
    {
        sectionTitle: "Successor Trustees/Pour over Will Executors",
        repeatable: true,
        maxInstances: 2,
        fields: [
            {
                name: "successorTrusteeAgentFullName",
                label: "Agents Full Name (include full address if not previously provided)",
                type: "textarea",
            },
            {
                name: "successorTrusteeRelationship",
                label: "Relationship",
                type: "text",
            },
            {
                name: "successorTrusteeIfMarriedFirstAgentSpouse",
                label: "If married, first agent will be Spouse:",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ],
            },
            {
                name: "successorTrusteeAgentsServe",
                label: "Agents will serve:",
                type: "radio",
                options: [
                    { value: "oneAtATime", label: "one at a time" },
                    { value: "twoAtATime", label: "two at a time" }
                ],
            },
        ]
    },
    {
        sectionTitle: "Durable Power Of Attorney for Property Management Agents",
        description: "(to help during period of incapacity) Skip this section if Agents are same order and selection as in Successor Trustees/Executors above",
        repeatable: true,
        maxInstances: 2,
        fields: [
            {
                name: "propertyManagementAgentFullName",
                label: "Agents Full Name (include full address if not previously provided)",
                type: "textarea",
            },
            {
                name: "propertyManagementAgentRelationship",
                label: "Relationship",
                type: "text",
            },
            {
                name: "propertyManagementAgentIfMarriedFirstAgentSpouse",
                label: "If married, first agent will be Spouse:",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ],
            },
            {
                name: "propertyManagementAgentAgentsServe",
                label: "Agents will serve:",
                type: "radio",
                options: [
                    { value: "oneAtATime", label: "one at a time" },
                    { value: "twoAtATime", label: "two at a time" }
                ],
            },
        ]
    },
    {
        sectionTitle: "Advance Health Care Agents",
        description: "(Complete for Client only) Skip this section if Agents are same order and persons as in Successor Trustees above",
        repeatable: true,
        maxInstances: 2,
        fields: [
            {
                name: "healthCareAgentFullName",
                label: "Agents Full Name (include full address if not previously provided) Do not list spouse's name here",
                type: "textarea",
            },
            {
                name: "healthCareAgentRelationship",
                label: "Relationship",
                type: "text",
            },
            {
                name: "healthCareAgentIfMarriedFirstAgentSpouse",
                label: "If married, first agent will be Spouse:",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ],
            },
            {
                name: "healthCareAgentAgentsServe",
                label: "Agents will serve:",
                type: "radio",
                options: [
                    { value: "oneAtATime", label: "one at a time" },
                    { value: "twoAtATime", label: "two at a time" }
                ],
            },
        ]
    },
    {
        sectionTitle: "Spouse's Advance Health Care Agents",
        description: "(Complete for Spouse only) Skip this section if Agents are same order and selection as in Successor Trustees above",
        repeatable: true,
        maxInstances: 2,
        fields: [
            {
                name: "spouseHealthCareAgentFullName",
                label: "Agents Full Name (include full address if not previously provided) Do not list spouse's name here",
                type: "textarea",
            },
            {
                name: "spouseHealthCareAgentRelationship",
                label: "Relationship",
                type: "text",
            },
            {
                name: "spouseHealthCareAgentIfMarriedFirstAgentSpouse",
                label: "If married, first agent will be Spouse:",
                type: "radio",
                options: [
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" }
                ],
            },
            {
                name: "spouseHealthCareAgentAgentsServe",
                label: "Agents will serve:",
                type: "radio",
                options: [
                    { value: "oneAtATime", label: "one at a time" },
                    { value: "twoAtATime", label: "two at a time" }
                ],
            },
        ]
    },
    {
        sectionTitle: "Guardian Of Minor Children",
        repeatable: true,
        maxInstances: 2,
        fields: [
            {
                name: "guardianFullNameAddress",
                label: "Guardians Full Name and Address",
                type: "textarea",
            },
            {
                name: "guardianRelationship",
                label: "Relationship",
                type: "text",
            },
        ]
    },
    {
        sectionTitle: "Cash Assets and Securities",
        description: "(don't include retirement accounts or insurance here - see below) (attach extra pages if needed)",
        repeatable: true,
        maxInstances: 8,
        fields: [
            {
                name: "cashAssetAccountType",
                label: "Account Type (see legend above)",
                type: "select",
                options: [
                    { value: "checking", label: "Checking" },
                    { value: "savings", label: "Savings" },
                    { value: "cd", label: "CD (include maturity date)" },
                    { value: "moneyMarket", label: "Money Market" },
                    { value: "brokerage", label: "Brokerage" },
                    { value: "corporateStocksCorporateBonds", label: "Corporate Stocks Corporate Bonds" },
                    { value: "mutualFunds", label: "Mutual Funds" },
                    { value: "treasuryBills", label: "Treasury Bills" },
                    { value: "savingsBonds", label: "Savings Bonds" }
                ],
            },
            {
                name: "cashAssetOwnershipType",
                label: "Ownership Type (see legend)",
                type: "radio",
                options: [
                    { value: "SB", label: "S/B" },
                    { value: "H", label: "H" },
                    { value: "W", label: "W" }
                ],
            },
            {
                name: "cashAssetAmount",
                label: "Amount",
                type: "number",
            },
            {
                name: "cashAssetFinancialInstitution",
                label: "Name of Financial Institution",
                type: "text",
            },
            {
                name: "cashAssetAccountNumberPolicyNumber",
                label: "Account / Policy/Member Number (incl. Maturity Date for CD's)",
                type: "text",
            },
        ]
    },
    {
        sectionTitle: "Retirement Plans, Insurance and Annuities",
        description: "(attach extra pages if needed)",
        repeatable: true,
        maxInstances: 2, // From the PDF, it has 2 numbered sections
        fields: [
            {
                name: "retirementAccountType",
                label: "Account Type (see legend)",
                type: "select",
                options: [
                    { value: "ira", label: "IRA" },
                    { value: "keogh", label: "Keogh" },
                    { value: "qualifiedPlan", label: "Qualified Plan" },
                    { value: "employerPlan", label: "Employer Plan" },
                    { value: "401k", label: "401(k)" },
                    { value: "deferredComp", label: "Deferred Comp" },
                    { value: "403b", label: "403(b)" },
                    { value: "annuity", label: "Annuity" },
                    { value: "pensionPlan", label: "Pension Plan" },
                    { value: "rothIra", label: "Roth IRA" },
                    { value: "insurance", label: "Insurance (incl. Face and Cash Values)" }
                ],
            },
            {
                name: "retirementOwnershipType",
                label: "Ownership (see legend)",
                type: "radio",
                options: [
                    { value: "SB", label: "S/B" },
                    { value: "H", label: "H" },
                    { value: "W", label: "W" }
                ],
            },
            {
                name: "retirementAmount",
                label: "Amount",
                type: "number",
            },
            {
                name: "retirementFinancialInstitution",
                label: "Financial Institution or Insurance Company",
                type: "text",
            },
            {
                name: "retirementAccountNumberPolicyNumber",
                label: "Account/Policy/Member Number (incl. Maturity Date for CD's)",
                type: "text",
            },
        ]
    },
    {
        sectionTitle: "Business Interests",
        description: "Note → Include Partnerships, Sole Proprietorships, and Close Corporations only",
        repeatable: true,
        maxInstances: 1, // Only one entry in the PDF
        fields: [
            {
                name: "businessNameAddressTaxId",
                label: "Provide Business Name, address and Tax ID",
                type: "textarea",
            },
            {
                name: "businessType",
                label: "Type of Business: (select one):",
                type: "checkbox",
                options: [
                    { value: "cCorp", label: "C-Corp" },
                    { value: "sCorp", label: "S-Corp" },
                    { value: "professionalCorp", label: "Professional Corp" },
                    { value: "partnership", label: "Partnership" },
                    { value: "soleProprietorship", label: "Sole Proprietorship" }
                ],
            },
        ]
    },
    {
        sectionTitle: "Vehicles, Mobile Homes, Boats, Aircrafts, etc.",
        description: "Not required -- all of these items are automatically transferred in to the trust by way of the bill of sale or general assignment.",
        fields: [
            {
                name: "vehiclesNotes",
                label: "Notes",
                type: "textarea", // This section seems to be informational, but if there's a need to add notes, a textarea is appropriate.
            },
        ]
    },
    {
        sectionTitle: "Miscellaneous Assets",
        description: "(Only include assets of value, that are to be transferred to Trust, i.e., Trust Deeds, coin collections, antiques, etc.)",
        repeatable: true,
        maxInstances: 2,
        fields: [
            {
                name: "miscellaneousAssetDescription",
                label: "Complete Description",
                type: "textarea",
            },
        ]
    },
    {
        sectionTitle: "Timeshare Memberships",
        repeatable: true,
        maxInstances: 1, // Only one entry in the PDF
        fields: [
            {
                name: "timeshareName",
                label: "Name of Resort/Timeshare:",
                type: "text",
            },
            {
                name: "timeshareDescription",
                label: "Complete Description",
                type: "textarea",
            },
            {
                name: "timeshareMembershipId",
                label: "Membership / ID Number:",
                type: "text",
            },
        ]
    },
    {
        sectionTitle: "Real Estate",
        description: "(attach extra sheets for additional properties)",
        repeatable: true,
        maxInstances: 2,
        fields: [
            {
                name: "realEstatePropertyAddress",
                label: "Complete Address (mark actual deed as \"# 1\"/\"# 2\"): ",
                type: "textarea",
            },
            {
                name: "realEstateCounty",
                label: "County:",
                type: "text",
            },
            {
                name: "realEstateApnTaxId",
                label: "APN or TAX ID:",
                type: "text",
            },
            {
                name: "realEstateMortgageBalance",
                label: "Mortgage Balance:",
                type: "number",
            },
            {
                name: "realEstateEquity",
                label: "Equity:",
                type: "number",
            },
            {
                name: "realEstateCommunitySeparateProperty",
                label: "Indicate whether community property or the separate property of one spouse:",
                type: "radio",
                options: [
                    { value: "community", label: "Community Property" },
                    { value: "separate", label: "Separate Property" }
                ],
            },
        ]
    },
    {
        sectionTitle: "Notes",
        fields: [
            {
                name: "generalNotes",
                label: "Notes",
                type: "textarea",
            },
        ]
    },
    {
        sectionTitle: "Declaration of Trust",
        fields: [
            {
                name: "clientSignature",
                label: "Client",
                type: "text",
            },
            {
                name: "clientDate",
                label: "Date",
                type: "date",
            },
            {
                name: "spouseSignature",
                label: "Spouse",
                type: "text",
            },
            {
                name: "spouseDate",
                label: "Date",
                type: "date",
            },
        ]
    },
];

export default formConfig;
