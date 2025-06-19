"use strict";
//Object.defineProperty(exports, "__esModule", { value: !0 });
const fullConfig = [
  {
    sobject: "UnitOfMeasureClass",
    externalIdField: "Code",
    query:
      "SELECT Name, Code, Description, Status FROM UnitOfMeasureClass WHERE Status = 'Active'",
    lookups: [],
    overrides: { Status: "Draft" },
  },
  {
    sobject: "UnitOfMeasure",
    externalIdField: "Name",
    query:
      "SELECT Name, CurrencyIsoCode, ConversionFactor, Description, Sequence, Status, Type, UnitCode, UnitOfMeasureClass.Code FROM UnitOfMeasure WHERE Status = 'Active'",
    lookups: [
      {
        field: "UnitOfMeasureClass",
        sobject: "UnitOfMeasureClass",
        externalId: "Code",
        targetField: "UnitOfMeasureClassId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "UnitOfMeasureClass",
    externalIdField: "Code",
    query:
      "SELECT Name, BaseUnitOfMeasure.Name, DefaultUnitOfMeasure.Name, Code, Description, Status FROM UnitOfMeasureClass WHERE Status = 'Active'",
    lookups: [
      {
        field: "BaseUnitOfMeasure",
        sobject: "UnitOfMeasure",
        externalId: "Name",
        targetField: "BaseUnitOfMeasureId",
      },
      {
        field: "DefaultUnitOfMeasure",
        sobject: "UnitOfMeasure",
        externalId: "Name",
        targetField: "DefaultUnitOfMeasureId",
      },
    ],
    overrides: { Status: "Active" },
  },
  {
    sobject: "AttributeCategory",
    externalIdField: "Code",
    query: "SELECT Name, Description, Code FROM AttributeCategory",
    lookups: [],
    overrides: {},
  },
  {
    sobject: "AttributePicklist",
    externalIdField: "Name",
    query:
      "SELECT Name, CurrencyIsoCode,Description, UnitOfMeasure.Name, DataType, Status FROM AttributePicklist WHERE Status = 'Active'",
    lookups: [
      {
        field: "UnitOfMeasure",
        sobject: "UnitOfMeasure",
        externalId: "Name",
        targetField: "UnitOfMeasureId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "AttributePicklistValue",
    externalIdField: "Code",
    query:
      "SELECT Name, CurrencyIsoCode, Code, Abbreviation, DisplayValue, IsDefault, Picklist.Name, Sequence, Status, Value FROM AttributePicklistValue WHERE Status = 'Active'",
    lookups: [
      {
        field: "Picklist",
        sobject: "AttributePicklist",
        externalId: "Name",
        targetField: "PicklistId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "AttributeDefinition",
    externalIdField: "Code",
    query:
      "SELECT Code, CurrencyIsoCode, DefaultHelpText, IsRequired, DataType,DefaultValue,Description,DeveloperName,IsActive, Label, Name, Picklist.Name, ValueDescription, UnitOfMeasure.Name FROM AttributeDefinition WHERE IsActive = true",
    lookups: [
      {
        field: "Picklist",
        sobject: "AttributePicklist",
        externalId: "Name",
        targetField: "PicklistId",
      },
      {
        field: "UnitOfMeasure",
        sobject: "UnitOfMeasure",
        externalId: "Name",
        targetField: "UnitOfMeasureId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "AttributeCategoryAttribute",
    compositeKey: {
      required: ["AttributeCategory.Code", "AttributeDefinition.Code"],
    },
    query:
      "SELECT CurrencyIsoCode, AttributeCategory.Code, AttributeDefinition.Code FROM AttributeCategoryAttribute",
    lookups: [
      {
        field: "AttributeCategory",
        sobject: "AttributeCategory",
        externalId: "Code",
        targetField: "AttributeCategoryId",
      },
      {
        field: "AttributeDefinition",
        sobject: "AttributeDefinition",
        externalId: "Code",
        targetField: "AttributeDefinitionId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "ProductClassification",
    externalIdField: "Name",
    query:
      "SELECT Code, CurrencyIsoCode, Name, Status FROM ProductClassification WHERE Status = 'Active'",
    lookups: [],
    overrides: {},
  },
  {
    sobject: "ProductClassificationAttr",
    compositeKey: {
      required: [
        "AttributeCategory.Code",
        "AttributeDefinition.Code",
        "ProductClassification.Code",
      ],
    },
    query:
      "SELECT AttributeCategory.Code, CurrencyIsoCode, AttributeDefinition.Code, AttributeNameOverride, DefaultValue, Description, DisplayType, HelpText, IsHidden, IsPriceImpacting, IsReadOnly, IsRequired, MaximumCharacterCount, MaximumValue, MinimumCharacterCount, MinimumValue, Name, ProductClassification.Code, Sequence, Status, StepValue, ValueDescription FROM ProductClassificationAttr WHERE Status = 'Active'",
    lookups: [
      {
        field: "AttributeCategory",
        sobject: "AttributeCategory",
        externalId: "Code",
        targetField: "AttributeCategoryId",
      },
      {
        field: "AttributeDefinition",
        sobject: "AttributeDefinition",
        externalId: "Code",
        targetField: "AttributeDefinitionId",
      },
      {
        field: "ProductClassification",
        sobject: "ProductClassification",
        externalId: "Code",
        targetField: "ProductClassificationId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "LegalEntity",
    externalIdField: "Name",
    query:
      "SELECT CompanyName, CurrencyIsoCode, Description, LegalEntityCity, LegalEntityCountry, LegalEntityGeocodeAccuracy, LegalEntityLatitude, LegalEntityLongitude, LegalEntityPostalCode, LegalEntityState, LegalEntityStreet, Name, Status FROM LegalEntity WHERE Status = 'Active'",
    lookups: [],
  },
  {
    sobject: "TaxPolicy",
    externalIdField: "Name",
    query:
      "SELECT Description, Name, Status, TreatmentSelection FROM TaxPolicy WHERE Status = 'Active'",
    lookups: [],
    overrides: { Status: "Draft" },
    mode: "insert-only",
  },
  {
    sobject: "TaxTreatment",
    externalIdField: "Name",
    query:
      "SELECT Description, IsTaxable, LegalEntity.Name, Name, ProductCode, Status, TaxCode, TaxPolicy.Name FROM TaxTreatment WHERE Status = 'Active'",
    lookups: [
      {
        field: "LegalEntity",
        sobject: "LegalEntity",
        externalId: "Name",
        targetField: "LegalEntityId",
      },
      {
        field: "TaxPolicy",
        sobject: "TaxPolicy",
        externalId: "Name",
        targetField: "TaxPolicyId",
      },
    ],
    mode: "insert-only",
  },
  {
    sobject: "TaxPolicy",
    externalIdField: "Name",
    query:
      "SELECT DefaultTaxTreatment.Name, Description, Name, Status, TreatmentSelection FROM TaxPolicy WHERE Status = 'Active'",
    lookups: [
      {
        field: "DefaultTaxTreatment",
        sobject: "TaxTreatment",
        externalId: "Name",
        targetField: "DefaultTaxTreatmentId",
      },
    ],
  },
  {
    sobject: "BillingPolicy",
    externalIdField: "Name",
    query:
      "SELECT BillingTreatmentSelection, Description, Name, Status FROM BillingPolicy WHERE Status = 'Active'",
    lookups: [],
    overrides: { Status: "Draft" },
    mode: "insert-only",
  },
  {
    sobject: "BillingTreatment",
    externalIdField: "Name",
    query:
      "SELECT BillingPolicy.Name, Description, ExcludeFromBilling, LegalEntity.Name, Name, Status FROM BillingTreatment WHERE Status = 'Active'",
    lookups: [
      {
        field: "BillingPolicy",
        sobject: "BillingPolicy",
        externalId: "Name",
        targetField: "BillingPolicyId",
      },
      {
        field: "LegalEntity",
        sobject: "LegalEntity",
        externalId: "Name",
        targetField: "LegalEntityId",
      },
    ],
    overrides: { Status: "Draft" },
    mode: "insert-only",
  },
  {
    sobject: "BillingTreatmentItem",
    externalIdField: "Name",
    query:
      "SELECT BillingTreatment.Name, BillingType, Controller, Description, FlatAmount, Handling0Amount, Name, Percentage, ProcessingOrder, Sequencing, Status, Type FROM BillingTreatmentItem WHERE Status = 'Active'",
    lookups: [
      {
        field: "BillingTreatment",
        sobject: "BillingTreatment",
        externalId: "Name",
        targetField: "BillingTreatmentId",
      },
    ],
    mode: "insert-only",
  },
  {
    sobject: "BillingTreatment",
    externalIdField: "Name",
    query: "SELECT Status FROM BillingTreatment WHERE Status = 'Active'",
    lookups: [
      {
        field: "BillingPolicy",
        sobject: "BillingPolicy",
        externalId: "Name",
        targetField: "BillingPolicyId",
      },
      {
        field: "LegalEntity",
        sobject: "LegalEntity",
        externalId: "Name",
        targetField: "LegalEntityId",
      },
    ],
  },
  {
    sobject: "BillingPolicy",
    externalIdField: "Name",
    query:
      "SELECT BillingTreatmentSelection, DefaultBillingTreatment.Name, Description, Name, Status FROM BillingPolicy WHERE Status = 'Active'",
    lookups: [
      {
        field: "DefaultBillingTreatment",
        sobject: "BillingTreatment",
        externalId: "Name",
        targetField: "DefaultBillingTreatmentId",
      },
    ],
  },
  {
    sobject: "Product2",
    externalIdField: "ProductCode",
    query:
      "SELECT CurrencyIsoCode, UnitOfMeasure.Name, AvailabilityDate, BasedOn.Code, BillingPolicy.Name, ConfigureDuringSale, Description, DiscontinuedDate, DisplayUrl, EndOfLifeDate, ExternalId, Family, HelpText, IsActive, IsAssetizable, IsSoldOnlyWithOtherProds, Name, ProductCode, QuantityUnitOfMeasure, StockKeepingUnit, TaxPolicy.Name, Type, UsageModelType FROM Product2 WHERE IsActive = true",
    lookups: [
      {
        field: "UnitOfMeasure",
        sobject: "UnitOfMeasure",
        externalId: "Name",
        targetField: "UnitOfMeasureId",
      },
      {
        field: "BasedOn",
        sobject: "ProductClassification",
        externalId: "Code",
        targetField: "BasedOnId",
      },
      {
        field: "BillingPolicy",
        sobject: "BillingPolicy",
        externalId: "Name",
        targetField: "BillingPolicyId",
      },
      {
        field: "TaxPolicy",
        sobject: "TaxPolicy",
        externalId: "Name",
        targetField: "TaxPolicyId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "Product2DataTranslation",
    externalIdField: "Name",
    query:
      "SELECT Name, Parent.ProductCode, Language FROM Product2DataTranslation",
    lookups: [
      {
        field: "Parent",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "ParentId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "CostBook",
    externalIdField: "Name",
    query: "SELECT Name, EffectiveFrom, EffectiveTo, IsDefault FROM CostBook",
    lookups: [],
    overrides: {},
  },
  {
    sobject: "CostBookEntry",
    compositeKey: {
      required: ["CostBook.Name", "Product.ProductCode"],
      optional: ["CurrencyIsoCode"],
    },
    query:
      "SELECT Cost, CostBook.Name, Product.ProductCode, CurrencyIsoCode, Description, EffectiveFrom, EffectiveTo  FROM CostBookEntry",
    lookups: [
      {
        field: "Product",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "ProductId",
      },
      {
        field: "CostBook",
        sobject: "CostBook",
        externalId: "Name",
        targetField: "CostBookId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "Pricebook2",
    externalIdField: "Name",
    query:
      "SELECT CurrencyIsoCode, CostBook.Name, Description, IsActive, Name, ValidFrom, ValidTo FROM Pricebook2",
    lookups: [
      {
        field: "CostBook",
        sobject: "CostBook",
        externalId: "Name",
        targetField: "CostBookId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "ProrationPolicy",
    externalIdField: "Name",
    query:
      "SELECT ArePartialPeriodsAllowed, Name, ProrationPolicyType, RemainderStrategy FROM ProrationPolicy",
    lookups: [],
    overrides: {},
    mode: "insert-only",
  },
  {
    sobject: "ProductSellingModel",
    externalIdField: "Name",
    query:
      "SELECT Name, PricingTerm, PricingTermUnit, SellingModelType, Status FROM ProductSellingModel WHERE Status = 'Active'",
    lookups: [],
    overrides: {},
  },
  {
    sobject: "ProductSellingModelOption",
    compositeKey: {
      required: ["ProductSellingModel.Name", "Product2.ProductCode"],
      optional: ["ProrationPolicy.Name"],
    },
    query:
      "SELECT IsDefault, Product2.ProductCode, ProductSellingModel.Name, ProrationPolicy.Name FROM ProductSellingModelOption",
    lookups: [
      {
        field: "Product2",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "Product2Id",
      },
      {
        field: "ProductSellingModel",
        sobject: "ProductSellingModel",
        externalId: "Name",
        targetField: "ProductSellingModelId",
      },
      {
        field: "ProrationPolicy",
        sobject: "ProrationPolicy",
        externalId: "Name",
        targetField: "ProrationPolicyId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "PricebookEntry",
    compositeKey: {
      required: [
        "ProductSellingModel.Name",
        "Product2.ProductCode",
        "Pricebook2.Name",
      ],
      optional: ["CurrencyIsoCode"],
    },
    query:
      "SELECT IsActive, CurrencyIsoCode, Pricebook2.Name, Product2.ProductCode, ProductSellingModel.Name, UnitPrice, UseStandardPrice FROM PricebookEntry WHERE IsActive = true",
    lookups: [
      {
        field: "Product2",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "Product2Id",
      },
      {
        field: "ProductSellingModel",
        sobject: "ProductSellingModel",
        externalId: "Name",
        targetField: "ProductSellingModelId",
      },
      {
        field: "Pricebook2",
        sobject: "Pricebook2",
        externalId: "Name",
        targetField: "Pricebook2Id",
      },
    ],
    overrides: {},
  },
  {
    sobject: "ProductCatalog",
    externalIdField: "Code",
    query:
      "SELECT Name, Code, CurrencyIsoCode, CatalogType, Description, EffectiveEndDate,EffectiveStartDate FROM ProductCatalog",
    lookups: [],
    overrides: {},
  },
  {
    sobject: "ProductCategory",
    externalIdField: "Code",
    query:
      "SELECT CurrencyIsoCode, Catalog.Code, Code, Description, IsNavigational, Name, ParentCategory.Code, SortOrder FROM ProductCategory",
    lookups: [
      {
        field: "Catalog",
        sobject: "ProductCatalog",
        externalId: "Code",
        targetField: "CatalogId",
      },
      {
        field: "ParentCategory",
        sobject: "ProductCategory",
        externalId: "Code",
        targetField: "ParentCategoryId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "ProductCategoryProduct",
    compositeKey: { required: ["ProductCategory.Code", "Product.ProductCode"] },
    query:
      "SELECT CurrencyIsoCode, ProductCategory.Code, Product.ProductCode FROM ProductCategoryProduct",
    lookups: [
      {
        field: "ProductCategory",
        sobject: "ProductCategory",
        externalId: "Code",
        targetField: "ProductCategoryId",
      },
      {
        field: "Product",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "ProductId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "ProductComponentGroup",
    externalIdField: "Code",
    query:
      "SELECT CurrencyIsoCode, Code, Description, MaxBundleComponents, MinBundleComponents, Name, ParentGroup.Code, ParentProduct.ProductCode, Sequence FROM ProductComponentGroup",
    lookups: [
      {
        field: "ParentGroup",
        sobject: "ProductComponentGroup",
        externalId: "Code",
        targetField: "ParentGroupId",
      },
      {
        field: "ParentProduct",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "ParentProductId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "ProductRelatedComponent",
    compositeKey: {
      required: [
        "ParentProduct.ProductCode",
        "ProductComponentGroup.Code",
        "ProductRelationshipType.Name",
      ],
      optional: [
        "ChildProductClassification.Code",
        "ChildProduct.ProductCode",
        "ChildSellingModel.Name",
        "ParentSellingModel.Name",
      ],
    },
    query:
      "SELECT ChildProductClassification.Code,ChildProduct.ProductCode, ChildSellingModel.Name, DoesBundlePriceIncludeChild,IsComponentRequired, IsDefaultComponent, IsQuantityEditable, MaxQuantity, MinQuantity, ParentProduct.ProductCode, ParentSellingModel.Name, ProductComponentGroup.Code, ProductRelationshipType.Name, Quantity,QuantityScaleMethod, Sequence FROM ProductRelatedComponent",
    lookups: [
      {
        field: "ChildProductClassification",
        sobject: "ProductClassification",
        externalId: "Code",
        targetField: "ChildProductClassificationId",
      },
      {
        field: "ChildProduct",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "ChildProductId",
      },
      {
        field: "ChildSellingModel",
        sobject: "ProductSellingModel",
        externalId: "Name",
        targetField: "ChildSellingModelId",
      },
      {
        field: "ParentProduct",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "ParentProductId",
      },
      {
        field: "ParentSellingModel",
        sobject: "ProductSellingModel",
        externalId: "Name",
        targetField: "ParentSellingModelId",
      },
      {
        field: "ProductComponentGroup",
        sobject: "ProductComponentGroup",
        externalId: "Code",
        targetField: "ProductComponentGroupId",
      },
      {
        field: "ProductRelationshipType",
        sobject: "ProductRelationshipType",
        externalId: "Name",
        targetField: "ProductRelationshipTypeId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "PriceAdjustmentSchedule",
    externalIdField: "Name",
    query:
      "SELECT CurrencyIsoCode, AdjustmentMethod, Description, EffectiveFrom, EffectiveTo, IsActive, Name, Pricebook2.Name, ScheduleType FROM PriceAdjustmentSchedule",
    lookups: [
      {
        field: "Pricebook2",
        sobject: "Pricebook2",
        externalId: "Name",
        targetField: "Pricebook2Id",
      },
    ],
    overrides: {},
  },
  {
    sobject: "PriceAdjustmentTier",
    compositeKey: {
      required: ["PriceAdjustmentSchedule.Name", "Product2.ProductCode"],
      optional: ["ProductSellingModel.Name", "CurrencyIsoCode"],
    },
    query:
      "SELECT AdjustmentType, CurrencyIsoCode, EffectiveFrom, EffectiveTo, LowerBound, PriceAdjustmentSchedule.Name , Product2.ProductCode, ProductSellingModel.Name, TierType, TierValue, UpperBound FROM PriceAdjustmentTier",
    lookups: [
      {
        field: "PriceAdjustmentSchedule",
        sobject: "PriceAdjustmentSchedule",
        externalId: "Name",
        targetField: "PriceAdjustmentScheduleId",
      },
      {
        field: "Product2",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "Product2Id",
      },
      {
        field: "ProductSellingModel",
        sobject: "ProductSellingModel",
        externalId: "Name",
        targetField: "ProductSellingModelId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "BundleBasedAdjustment",
    compositeKey: {
      required: [
        "PriceAdjustmentSchedule.Name",
        "ParentProduct.ProductCode",
        "Product.ProductCode",
      ],
      optional: [
        "ParentProductSellingModel.Name",
        "ProductSellingModel.Name",
        "RootProductSellingModel.Name",
        "CurrencyIsoCode",
      ],
    },
    query:
      "SELECT CurrencyIsoCode, AdjustmentType, AdjustmentValue, EffectiveFrom, EffectiveTo, ParentProduct.ProductCode, ParentProductSellingModel.Name, PriceAdjustmentSchedule.Name, Product.ProductCode, ProductSellingModel.Name, RootBundle.ProductCode, RootProductSellingModel.Name FROM BundleBasedAdjustment",
    lookups: [
      {
        field: "PriceAdjustmentSchedule",
        sobject: "PriceAdjustmentSchedule",
        externalId: "Name",
        targetField: "PriceAdjustmentScheduleId",
      },
      {
        field: "ParentProduct",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "ParentProductId",
      },
      {
        field: "ParentProductSellingModel",
        sobject: "ProductSellingModel",
        externalId: "Name",
        targetField: "ParentProductSellingModelId",
      },
      {
        field: "Product",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "Product2Id",
      },
      {
        field: "ProductSellingModel",
        sobject: "ProductSellingModel",
        externalId: "Name",
        targetField: "ProductSellingModelId",
      },
      {
        field: "RootBundle",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "RootBundleId",
      },
      {
        field: "RootProductSellingModel",
        sobject: "Product2",
        externalId: "Name",
        targetField: "RootProductSellingModelId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "AttributeBasedAdjRule",
    externalIdField: "Name",
    query: "SELECT Name FROM AttributeBasedAdjRule",
    lookups: [],
    overrides: {},
  },
  {
    sobject: "AttributeAdjustmentCondition",
    compositeKey: {
      required: [
        "AttributeBasedAdjRule.Name",
        "AttributeDefinition.Name",
        "Product.ProductCode",
      ],
    },
    query:
      "SELECT AttributeBasedAdjRule.Name, AttributeDefinition.Name, BooleanValue, DateValue, DateTimeValue, DoubleValue, IntegerValue, Operator, Product.ProductCode, StringValue FROM AttributeAdjustmentCondition",
    lookups: [
      {
        field: "AttributeBasedAdjRule",
        sobject: "AttributeBasedAdjRule",
        externalId: "Name",
        targetField: "AttributeBasedAdjRuleId",
      },
      {
        field: "AttributeDefinition",
        sobject: "AttributeDefinition",
        externalId: "Name",
        targetField: "AttributeDefinitionId",
      },
      {
        field: "Product",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "ProductId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "AttributeBasedAdjustment",
    compositeKey: {
      required: [
        "AttributeBasedAdjRule.Name",
        "PriceAdjustmentSchedule.Name",
        "Product.ProductCode",
      ],
      optional: ["CurrencyIsoCode"],
    },
    query:
      "SELECT CurrencyIsoCode, AdjustmentType, AdjustmentValue, AttributeBasedAdjRule.Name, EffectiveFrom, EffectiveTo, PriceAdjustmentSchedule.Name, Product.ProductCode, ProductSellingModel.Name FROM AttributeBasedAdjustment",
    lookups: [
      {
        field: "AttributeBasedAdjRule",
        sobject: "AttributeBasedAdjRule",
        externalId: "Name",
        targetField: "AttributeBasedAdjRuleId",
      },
      {
        field: "PriceAdjustmentSchedule",
        sobject: "PriceAdjustmentSchedule",
        externalId: "Name",
        targetField: "PriceAdjustmentScheduleId",
      },
      {
        field: "Product",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "ProductId",
      },
    ],
    overrides: {},
  },
  {
    sobject: "ProductConfigurationFlow",
    externalIdField: "FlowIdentifier",
    query:
      "SELECT CurrencyIsoCode, FlowIdentifier, Status, IsDefault FROM ProductConfigurationFlow WHERE Status = 'Active'",
    lookups: [],
    mode: "insert-only",
    overrides: {},
  },
  {
    sobject: "ProductConfigFlowAssignment",
    compositeKey: {
      required: ["ProductConfigurationFlow.FlowIdentifier"],
      optional: ["ProductClassification.Code", "Product.ProductCode"],
    },
    query:
      "SELECT ProductClassification.Code, ProductConfigurationFlow.FlowIdentifier, Product.ProductCode, CurrencyIsoCode FROM ProductConfigFlowAssignment",
    lookups: [
      {
        field: "ProductClassification",
        sobject: "ProductClassification",
        externalId: "Code",
        targetField: "ProductClassificationId",
      },
      {
        field: "ProductConfigurationFlow",
        sobject: "ProductConfigurationFlow",
        externalId: "FlowIdentifier",
        targetField: "ProductConfigurationFlowId",
      },
      {
        field: "Product",
        sobject: "Product2",
        externalId: "ProductCode",
        targetField: "ProductId",
      },
    ],
    overrides: {},
  },
];
