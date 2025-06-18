-- Script to create a database and tables in PostgreSQL

-- Step 1: Create a new database
CREATE DATABASE product_catalog_db
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- Step 2: Connect to the new database
\c product_catalog_db

-- Step 3: Create schemas and tables
-- Product2 (Central entity, assumed as a standard Salesforce object)
CREATE TABLE Product2 (
    Id VARCHAR(18) PRIMARY KEY,
    Name VARCHAR(255),
    ProductCode VARCHAR(255),
    IsActive BOOLEAN DEFAULT FALSE
);

-- Product Related Component
CREATE TABLE Product_Related_Component (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    RelatedComponentOverrideId VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id),
    FOREIGN KEY (RelatedComponentOverrideId) REFERENCES Product_Component_Group_Override(Id)
);

-- Product Relationship Type
CREATE TABLE Product_Relationship_Type (
    Id VARCHAR(18) PRIMARY KEY,
    Name VARCHAR(255)
);

-- Product Component Group Override
CREATE TABLE Product_Component_Group_Override (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    ComponentGroupId VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id),
    FOREIGN KEY (ComponentGroupId) REFERENCES Product_Component_Group(Id)
);

-- Product Qualification
CREATE TABLE Product_Qualification (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id)
);

-- Product Disqualification
CREATE TABLE Product_Disqualification (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id)
);

-- Product Selling Model
CREATE TABLE Product_Selling_Model (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id)
);

-- Product Specification Type
CREATE TABLE Product_Specification_Type (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id)
);

-- Product Specification Record Type
CREATE TABLE Product_Specification_Record_Type (
    Id VARCHAR(18) PRIMARY KEY,
    SpecificationTypeId VARCHAR(18),
    FOREIGN KEY (SpecificationTypeId) REFERENCES Product_Specification_Type(Id)
);

-- Product Attribute Definition
CREATE TABLE Product_Attribute_Definition (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    AttributePicklistId VARCHAR(18),
    AttributeExcludedValueId VARCHAR(18),
    AttributeCategoryId VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id),
    FOREIGN KEY (AttributePicklistId) REFERENCES Attribute_Picklist(Id),
    FOREIGN KEY (AttributeExcludedValueId) REFERENCES Attribute_Excluded_Value(Id),
    FOREIGN KEY (AttributeCategoryId) REFERENCES Attribute_Category(Id)
);

-- Attribute Picklist
CREATE TABLE Attribute_Picklist (
    Id VARCHAR(18) PRIMARY KEY,
    Name VARCHAR(255)
);

-- Attribute Excluded Value
CREATE TABLE Attribute_Excluded_Value (
    Id VARCHAR(18) PRIMARY KEY,
    AttributePicklistId VARCHAR(18),
    Value VARCHAR(255),
    FOREIGN KEY (AttributePicklistId) REFERENCES Attribute_Picklist(Id)
);

-- Product Classification
CREATE TABLE Product_Classification (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    AttributeCategoryId VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id),
    FOREIGN KEY (AttributeCategoryId) REFERENCES Attribute_Category(Id)
);

-- Attribute Category
CREATE TABLE Attribute_Category (
    Id VARCHAR(18) PRIMARY KEY,
    Name VARCHAR(255)
);

-- Product Category Disqualification
CREATE TABLE Product_Category_Disqualification (
    Id VARCHAR(18) PRIMARY KEY,
    ProductCategoryId VARCHAR(18),
    FOREIGN KEY (ProductCategoryId) REFERENCES Product_Category(Id)
);

-- Product Category
CREATE TABLE Product_Category (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id)
);

-- Product Category Commerce Search Index
CREATE TABLE Product_Category_Commerce_Search_Index (
    Id VARCHAR(18) PRIMARY KEY,
    ProductCategoryId VARCHAR(18),
    FOREIGN KEY (ProductCategoryId) REFERENCES Product_Category(Id)
);

-- Product Category Commerce Search Payload
CREATE TABLE Product_Category_Commerce_Search_Payload (
    Id VARCHAR(18) PRIMARY KEY,
    ProductCategoryId VARCHAR(18),
    FOREIGN KEY (ProductCategoryId) REFERENCES Product_Category(Id)
);

-- Product Category Translation Event
CREATE TABLE Product_Category_Translation_Event (
    Id VARCHAR(18) PRIMARY KEY,
    ProductCategoryId VARCHAR(18),
    FOREIGN KEY (ProductCategoryId) REFERENCES Product_Category(Id)
);

-- Product Catalog
CREATE TABLE Product_Catalog (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id)
);

-- Product Catalog Runtime Index Setting
CREATE TABLE Product_Catalog_Runtime_Index_Setting (
    Id VARCHAR(18) PRIMARY KEY,
    ProductCatalogId VARCHAR(18),
    FOREIGN KEY (ProductCatalogId) REFERENCES Product_Catalog(Id)
);

-- Product Category Commerce Search Changelist
CREATE TABLE Product_Category_Commerce_Search_Changelist (
    Id VARCHAR(18) PRIMARY KEY,
    ProductCategoryId VARCHAR(18),
    FOREIGN KEY (ProductCategoryId) REFERENCES Product_Category(Id)
);

-- Commerce Search Payload
CREATE TABLE Commerce_Search_Payload (
    Id VARCHAR(18) PRIMARY KEY,
    ProductCatalogId VARCHAR(18),
    FOREIGN KEY (ProductCatalogId) REFERENCES Product_Catalog(Id)
);

-- Web Store Search Attributes Settings
CREATE TABLE Web_Store_Search_Attributes_Settings (
    Id VARCHAR(18) PRIMARY KEY,
    OrganizationId VARCHAR(18),
    FOREIGN KEY (OrganizationId) REFERENCES Organization(Id)
);

-- Organization
CREATE TABLE Organization (
    Id VARCHAR(18) PRIMARY KEY,
    Name VARCHAR(255)
);

-- Product Component Group
CREATE TABLE Product_Component_Group (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id)
);

-- Product Component
CREATE TABLE Product_Component (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    ComponentGroupId VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id),
    FOREIGN KEY (ComponentGroupId) REFERENCES Product_Component_Group(Id)
);

-- Product Proration Policy
CREATE TABLE Product_Proration_Policy (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id)
);

-- Product Commerce Search Index Error
CREATE TABLE Product_Commerce_Search_Index_Error (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id)
);

-- Product Commerce Search Index Info
CREATE TABLE Product_Commerce_Search_Index_Info (
    Id VARCHAR(18) PRIMARY KEY,
    Product2Id VARCHAR(18),
    FOREIGN KEY (Product2Id) REFERENCES Product2(Id)
);

-- Runtime Catalog Snapshot Index
CREATE TABLE Runtime_Catalog_Snapshot_Index (
    Id VARCHAR(18) PRIMARY KEY,
    RuntimeSnapshotId VARCHAR(18),
    FOREIGN KEY (RuntimeSnapshotId) REFERENCES Runtime_Snapshot(Id)
);

-- Runtime Snapshot
CREATE TABLE Runtime_Snapshot (
    Id VARCHAR(18) PRIMARY KEY,
    ProductCatalogId VARCHAR(18),
    FOREIGN KEY (ProductCatalogId) REFERENCES Product_Catalog(Id)
);

-- Commerce Search Changelist
CREATE TABLE Commerce_Search_Changelist (
    Id VARCHAR(18) PRIMARY KEY,
    ProductCatalogId VARCHAR(18),
    FOREIGN KEY (ProductCatalogId) REFERENCES Product_Catalog(Id)
);

-- Commerce Search Index
CREATE TABLE Commerce_Search_Index (
    Id VARCHAR(18) PRIMARY KEY,
    ProductCatalogId VARCHAR(18),
    FOREIGN KEY (ProductCatalogId) REFERENCES Product_Catalog(Id)
);

-- Step 4: Add indexes for performance
CREATE INDEX idx_product2_id ON Product_Related_Component(Product2Id);
CREATE INDEX idx_component_group_id ON Product_Component_Group_Override(ComponentGroupId);
CREATE INDEX idx_product_category_id ON Product_Category_Disqualification(ProductCategoryId);
CREATE INDEX idx_product_catalog_id ON Product_Catalog_Runtime_Index_Setting(ProductCatalogId);

-- Step 5: Verify table creation
\d