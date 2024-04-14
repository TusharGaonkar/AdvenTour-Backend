## AdvenTour MongoDB schema design choices

Model name: AdvenTour (v-1.0)

Author: Tushar Gaonkar (gaonkar.tushar01@gmail.com)

Created with: [Hackolade](https://hackolade.com/) - Polyglot data modeling for NoSQL databases, storage formats, REST APIs, and JSON in RDBMS

### <a id="contents"></a>

- [Table of Contents](#contents)
- [1\. Model](#model)
- [2\. Relationships](#relationships)
  - [2.1 fk tours.\_id to bookings.tour](#4845313c-1d19-459a-ac12-6d485131e5df)
  - [2.2 fk users.\_id to bookings.user](#e43d34ee-5b97-4f87-9b0d-404a3be61784)
  - [2.3 fk tours.\_id to bookmarkedtours.tour](#1b405dae-943f-4a38-afdf-341e1f94d50d)
  - [2.4 fk users.\_id to bookmarkedtours.user](#c393b3b6-17ce-4916-a7e1-1eda370d49b2)
  - [2.5 fk tours.\_id to tourreviews.tour](#6b5a2ad0-b10b-40c8-a2b0-9364eac8e072)
  - [2.6 fk users.\_id to tourreviews.user](#8ee9efb2-62eb-4cd3-af7a-42623a88def7)
  - [2.7 fk users.\_id to tours.createdBy](#eed26d02-19d4-4944-983d-f7048fc6fb42)
  - [2.8 fk users.\_id to toursvalidations.createdBy](#85fda57f-284e-4af0-9e1c-fac4123c1e39)

### <a id="model"></a>

##### 1\. Model **AdvenTour (v-1.0)**

##### 1.1.1 **AdvenTour (v-1.0)** Entity Relationship Diagram

![Hackolade image](docs/image2.png?raw=true)

##### 2\. Relationships

### <a id="4845313c-1d19-459a-ac12-6d485131e5df"></a>2.1 Relationship **fk tours.\_id to bookings.tour**

##### 2.1.1 **fk tours.\_id to bookings.tour** Diagram

<table><thead><tr><td>Parent Table</td><td>Parent field</td></tr></thead><tbody><tr><td><a href=#622ce972-290e-4c72-a1cc-6c430d62e13a>tours</a></td><td><a href=#f708c1d3-038a-40a9-94f1-cab8264535f7>_id</a></td></tr></tbody></table>

![Hackolade image](docs/image3.png?raw=true)![Hackolade image](docs/image4.png?raw=true)

<table><thead><tr><td>Child Table</td><td>Child field</td></tr></thead><tbody><tr><td><a href=#27bae674-5a3e-4eae-9f07-ae07da9b2dbc>bookings</a></td><td><a href=#66d5de81-3cc5-4361-836b-12c0114499f0>tour</a></td></tr></tbody></table>

##### 2.1.2 **fk tours.\_id to bookings.tour** Properties

<table><thead><tr><td>Property</td><td>Value</td></tr></thead><tbody><tr><td>Name</td><td>fk tours._id to bookings.tour</td></tr><tr><td>Description</td><td></td></tr><tr><td>Parent Collection</td><td><a href=#622ce972-290e-4c72-a1cc-6c430d62e13a>tours</a></td></tr><tr><td>Parent field</td><td><a href=#f708c1d3-038a-40a9-94f1-cab8264535f7>_id</a></td></tr><tr><td>Parent Cardinality</td><td>1</td></tr><tr><td>Child Collection</td><td><a href=#27bae674-5a3e-4eae-9f07-ae07da9b2dbc>bookings</a></td></tr><tr><td>Child field</td><td><a href=#66d5de81-3cc5-4361-836b-12c0114499f0>tour</a></td></tr><tr><td>Child Cardinality</td><td>0..n</td></tr></tbody></table>

### <a id="e43d34ee-5b97-4f87-9b0d-404a3be61784"></a>2.2 Relationship **fk users.\_id to bookings.user**

##### 2.2.1 **fk users.\_id to bookings.user** Diagram

<table><thead><tr><td>Parent Table</td><td>Parent field</td></tr></thead><tbody><tr><td><a href=#f59d62ae-2921-43db-bfb0-1abcf6bfb8a3>users</a></td><td><a href=#948ee914-2145-48b1-90b9-65b0ae6cfa17>_id</a></td></tr></tbody></table>

![Hackolade image](docs/image5.png?raw=true)![Hackolade image](docs/image6.png?raw=true)

<table><thead><tr><td>Child Table</td><td>Child field</td></tr></thead><tbody><tr><td><a href=#27bae674-5a3e-4eae-9f07-ae07da9b2dbc>bookings</a></td><td><a href=#9344bc0a-9a0c-4984-8091-bddadaf5a59e>user</a></td></tr></tbody></table>

##### 2.2.2 **fk users.\_id to bookings.user** Properties

<table><thead><tr><td>Property</td><td>Value</td></tr></thead><tbody><tr><td>Name</td><td>fk users._id to bookings.user</td></tr><tr><td>Description</td><td></td></tr><tr><td>Parent Collection</td><td><a href=#f59d62ae-2921-43db-bfb0-1abcf6bfb8a3>users</a></td></tr><tr><td>Parent field</td><td><a href=#948ee914-2145-48b1-90b9-65b0ae6cfa17>_id</a></td></tr><tr><td>Parent Cardinality</td><td>1</td></tr><tr><td>Child Collection</td><td><a href=#27bae674-5a3e-4eae-9f07-ae07da9b2dbc>bookings</a></td></tr><tr><td>Child field</td><td><a href=#9344bc0a-9a0c-4984-8091-bddadaf5a59e>user</a></td></tr><tr><td>Child Cardinality</td><td>0..n</td></tr></tbody></table>

### <a id="1b405dae-943f-4a38-afdf-341e1f94d50d"></a>2.3 Relationship **fk tours.\_id to bookmarkedtours.tour**

##### 2.3.1 **fk tours.\_id to bookmarkedtours.tour** Diagram

<table><thead><tr><td>Parent Table</td><td>Parent field</td></tr></thead><tbody><tr><td><a href=#622ce972-290e-4c72-a1cc-6c430d62e13a>tours</a></td><td><a href=#f708c1d3-038a-40a9-94f1-cab8264535f7>_id</a></td></tr></tbody></table>

![Hackolade image](docs/image7.png?raw=true)![Hackolade image](docs/image8.png?raw=true)

<table><thead><tr><td>Child Table</td><td>Child field</td></tr></thead><tbody><tr><td><a href=#0332a630-0b04-4c6d-97a0-8c299cc49568>bookmarkedtours</a></td><td><a href=#0d1a0e43-7a3c-4c20-ba7f-9cbe9a055aac>tour</a></td></tr></tbody></table>

##### 2.3.2 **fk tours.\_id to bookmarkedtours.tour** Properties

<table><thead><tr><td>Property</td><td>Value</td></tr></thead><tbody><tr><td>Name</td><td>fk tours._id to bookmarkedtours.tour</td></tr><tr><td>Description</td><td></td></tr><tr><td>Parent Collection</td><td><a href=#622ce972-290e-4c72-a1cc-6c430d62e13a>tours</a></td></tr><tr><td>Parent field</td><td><a href=#f708c1d3-038a-40a9-94f1-cab8264535f7>_id</a></td></tr><tr><td>Parent Cardinality</td><td>1</td></tr><tr><td>Child Collection</td><td><a href=#0332a630-0b04-4c6d-97a0-8c299cc49568>bookmarkedtours</a></td></tr><tr><td>Child field</td><td><a href=#0d1a0e43-7a3c-4c20-ba7f-9cbe9a055aac>tour</a></td></tr><tr><td>Child Cardinality</td><td>0..n</td></tr></tbody></table>

### <a id="c393b3b6-17ce-4916-a7e1-1eda370d49b2"></a>2.4 Relationship **fk users.\_id to bookmarkedtours.user**

##### 2.4.1 **fk users.\_id to bookmarkedtours.user** Diagram

<table><thead><tr><td>Parent Table</td><td>Parent field</td></tr></thead><tbody><tr><td><a href=#f59d62ae-2921-43db-bfb0-1abcf6bfb8a3>users</a></td><td><a href=#948ee914-2145-48b1-90b9-65b0ae6cfa17>_id</a></td></tr></tbody></table>

![Hackolade image](docs/image9.png?raw=true)![Hackolade image](docs/image10.png?raw=true)

<table><thead><tr><td>Child Table</td><td>Child field</td></tr></thead><tbody><tr><td><a href=#0332a630-0b04-4c6d-97a0-8c299cc49568>bookmarkedtours</a></td><td><a href=#cb9a36a9-e0e4-46f5-8455-272db16c986c>user</a></td></tr></tbody></table>

##### 2.4.2 **fk users.\_id to bookmarkedtours.user** Properties

<table><thead><tr><td>Property</td><td>Value</td></tr></thead><tbody><tr><td>Name</td><td>fk users._id to bookmarkedtours.user</td></tr><tr><td>Description</td><td></td></tr><tr><td>Parent Collection</td><td><a href=#f59d62ae-2921-43db-bfb0-1abcf6bfb8a3>users</a></td></tr><tr><td>Parent field</td><td><a href=#948ee914-2145-48b1-90b9-65b0ae6cfa17>_id</a></td></tr><tr><td>Parent Cardinality</td><td>1</td></tr><tr><td>Child Collection</td><td><a href=#0332a630-0b04-4c6d-97a0-8c299cc49568>bookmarkedtours</a></td></tr><tr><td>Child field</td><td><a href=#cb9a36a9-e0e4-46f5-8455-272db16c986c>user</a></td></tr><tr><td>Child Cardinality</td><td>0..n</td></tr></tbody></table>

### <a id="6b5a2ad0-b10b-40c8-a2b0-9364eac8e072"></a>3.5 Relationship **fk tours.\_id to tourreviews.tour**

##### 2.5.1 **fk tours.\_id to tourreviews.tour** Diagram

<table><thead><tr><td>Parent Table</td><td>Parent field</td></tr></thead><tbody><tr><td><a href=#622ce972-290e-4c72-a1cc-6c430d62e13a>tours</a></td><td><a href=#f708c1d3-038a-40a9-94f1-cab8264535f7>_id</a></td></tr></tbody></table>

![Hackolade image](docs/image11.png?raw=true)![Hackolade image](docs/image12.png?raw=true)

<table><thead><tr><td>Child Table</td><td>Child field</td></tr></thead><tbody><tr><td><a href=#02700ff6-66ff-4ad6-a117-e2f9cbb1eb8e>tourreviews</a></td><td><a href=#73dc209d-f495-4858-8463-55a15c2531a6>tour</a></td></tr></tbody></table>

##### 2.5.2 **fk tours.\_id to tourreviews.tour** Properties

<table><thead><tr><td>Property</td><td>Value</td></tr></thead><tbody><tr><td>Name</td><td>fk tours._id to tourreviews.tour</td></tr><tr><td>Description</td><td></td></tr><tr><td>Parent Collection</td><td><a href=#622ce972-290e-4c72-a1cc-6c430d62e13a>tours</a></td></tr><tr><td>Parent field</td><td><a href=#f708c1d3-038a-40a9-94f1-cab8264535f7>_id</a></td></tr><tr><td>Parent Cardinality</td><td>1</td></tr><tr><td>Child Collection</td><td><a href=#02700ff6-66ff-4ad6-a117-e2f9cbb1eb8e>tourreviews</a></td></tr><tr><td>Child field</td><td><a href=#73dc209d-f495-4858-8463-55a15c2531a6>tour</a></td></tr><tr><td>Child Cardinality</td><td>0..n</td></tr></tbody></table>

### <a id="8ee9efb2-62eb-4cd3-af7a-42623a88def7"></a>2.6 Relationship **fk users.\_id to tourreviews.user**

##### 2.6.1 **fk users.\_id to tourreviews.user** Diagram

<table><thead><tr><td>Parent Table</td><td>Parent field</td></tr></thead><tbody><tr><td><a href=#f59d62ae-2921-43db-bfb0-1abcf6bfb8a3>users</a></td><td><a href=#948ee914-2145-48b1-90b9-65b0ae6cfa17>_id</a></td></tr></tbody></table>

![Hackolade image](docs/image13.png?raw=true)![Hackolade image](docs/image14.png?raw=true)

<table><thead><tr><td>Child Table</td><td>Child field</td></tr></thead><tbody><tr><td><a href=#02700ff6-66ff-4ad6-a117-e2f9cbb1eb8e>tourreviews</a></td><td><a href=#73655d24-8fdb-4328-a06d-d5c64a5c7c5d>user</a></td></tr></tbody></table>

##### 2.6.2 **fk users.\_id to tourreviews.user** Properties

<table><thead><tr><td>Property</td><td>Value</td></tr></thead><tbody><tr><td>Name</td><td>fk users._id to tourreviews.user</td></tr><tr><td>Description</td><td></td></tr><tr><td>Parent Collection</td><td><a href=#f59d62ae-2921-43db-bfb0-1abcf6bfb8a3>users</a></td></tr><tr><td>Parent field</td><td><a href=#948ee914-2145-48b1-90b9-65b0ae6cfa17>_id</a></td></tr><tr><td>Parent Cardinality</td><td>1</td></tr><tr><td>Child Collection</td><td><a href=#02700ff6-66ff-4ad6-a117-e2f9cbb1eb8e>tourreviews</a></td></tr><tr><td>Child field</td><td><a href=#73655d24-8fdb-4328-a06d-d5c64a5c7c5d>user</a></td></tr><tr><td>Child Cardinality</td><td>0..n</td></tr></tbody></table>

### <a id="eed26d02-19d4-4944-983d-f7048fc6fb42"></a>2.7 Relationship **fk users.\_id to tours.createdBy**

##### 2.7.1 **fk users.\_id to tours.createdBy** Diagram

<table><thead><tr><td>Parent Table</td><td>Parent field</td></tr></thead><tbody><tr><td><a href=#f59d62ae-2921-43db-bfb0-1abcf6bfb8a3>users</a></td><td><a href=#948ee914-2145-48b1-90b9-65b0ae6cfa17>_id</a></td></tr></tbody></table>

![Hackolade image](docs/image15.png?raw=true)![Hackolade image](docs/image16.png?raw=true)

<table><thead><tr><td>Child Table</td><td>Child field</td></tr></thead><tbody><tr><td><a href=#622ce972-290e-4c72-a1cc-6c430d62e13a>tours</a></td><td><a href=#3692f27b-8e33-49e4-8746-401f0fddb8d3>createdBy</a></td></tr></tbody></table>

##### 2.7.2 **fk users.\_id to tours.createdBy** Properties

<table><thead><tr><td>Property</td><td>Value</td></tr></thead><tbody><tr><td>Name</td><td>fk users._id to tours.createdBy</td></tr><tr><td>Description</td><td></td></tr><tr><td>Parent Collection</td><td><a href=#f59d62ae-2921-43db-bfb0-1abcf6bfb8a3>users</a></td></tr><tr><td>Parent field</td><td><a href=#948ee914-2145-48b1-90b9-65b0ae6cfa17>_id</a></td></tr><tr><td>Parent Cardinality</td><td>1</td></tr><tr><td>Child Collection</td><td><a href=#622ce972-290e-4c72-a1cc-6c430d62e13a>tours</a></td></tr><tr><td>Child field</td><td><a href=#3692f27b-8e33-49e4-8746-401f0fddb8d3>createdBy</a></td></tr><tr><td>Child Cardinality</td><td>0..n</td></tr></tbody></table>

### <a id="85fda57f-284e-4af0-9e1c-fac4123c1e39"></a>2.8 Relationship **fk users.\_id to toursvalidations.createdBy**

##### 2.8.1 **fk users.\_id to toursvalidations.createdBy** Diagram

<table><thead><tr><td>Parent Table</td><td>Parent field</td></tr></thead><tbody><tr><td><a href=#f59d62ae-2921-43db-bfb0-1abcf6bfb8a3>users</a></td><td><a href=#948ee914-2145-48b1-90b9-65b0ae6cfa17>_id</a></td></tr></tbody></table>

![Hackolade image](docs/image17.png?raw=true)![Hackolade image](docs/image18.png?raw=true)

<table><thead><tr><td>Child Table</td><td>Child field</td></tr></thead><tbody><tr><td><a href=#48094a55-df9b-4023-a65d-70b6ea8ed9d8>toursvalidations</a></td><td><a href=#f37d30cd-f4ca-4369-8e27-b86ecb969812>createdBy</a></td></tr></tbody></table>

##### 2.8.2 **fk users.\_id to toursvalidations.createdBy** Properties

<table><thead><tr><td>Property</td><td>Value</td></tr></thead><tbody><tr><td>Name</td><td>fk users._id to toursvalidations.createdBy</td></tr><tr><td>Description</td><td></td></tr><tr><td>Parent Collection</td><td><a href=#f59d62ae-2921-43db-bfb0-1abcf6bfb8a3>users</a></td></tr><tr><td>Parent field</td><td><a href=#948ee914-2145-48b1-90b9-65b0ae6cfa17>_id</a></td></tr><tr><td>Parent Cardinality</td><td>1</td></tr><tr><td>Child Collection</td><td><a href=#48094a55-df9b-4023-a65d-70b6ea8ed9d8>toursvalidations</a></td></tr><tr><td>Child field</td><td><a href=#f37d30cd-f4ca-4369-8e27-b86ecb969812>createdBy</a></td></tr><tr><td>Child Cardinality</td><td>0..n</td></tr></tbody></table>

### <a id="edges"></a>
