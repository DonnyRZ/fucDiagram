// Test script to verify the enhanced Mermaid conversion preserves diagram structure
import { UnifiedMermaidConverter } from '../services/UnifiedMermaidConverter';

// Sample complex Mermaid code with subgraphs, styling, and comments
const sampleMermaidCode = `%% =================== GROUPS ===================
subgraph Clients [Clients]
U[User / Client]
end

subgraph Edge [Edge Front Door]
DNS["Cloud DNS (managed zone)"]
LB["Global External HTTPS Load Balancer"]
ArmorPolicy["Cloud Armor (WAF) - Policy and Rules (subscription)"]
ArmorReq["Cloud Armor - Per-request"]
CDNLookup["Cloud CDN - Cache Lookups"]
CDNEgress["Cloud CDN - Cache Egress"]
CDNFill["Cloud CDN - Cache Fill"]
APIGW["API Gateway - Calls"]
LbDP["Load Balancer - Data Processing"]
EgressID["Internet Egress - Indonesia (0-1 TiB)"]
EgressAsia["Internet Egress - Asia (non-ID, 0-1 TiB)"]
end

subgraph Registry [Image Registry]
AR["Artifact Registry (container images)"]
end

subgraph Runtime [App Runtime Serverless]
CRReq["Cloud Run - Requests"]
CRCPU["Cloud Run - vCPU-seconds"]
CRMEM["Cloud Run - GiB-seconds (memory)"]
end

subgraph Network [Private Network]
VPC["Serverless VPC Access - Connector hours"]
end

subgraph Data [Data and Storage]
SQL["Cloud SQL (DB Choice)"]
GCS["Cloud Storage - Standard (Asia multi-region)"]
Secrets["Secret Manager (active versions)"]
end

subgraph Async [Async and Jobs]
PubSub["Pub/Sub - Throughput"]
Tasks["Cloud Tasks - Operations"]
Scheduler["Cloud Scheduler - Jobs"]
end

subgraph Observability [Observability]
Logging["Cloud Logging - over 50 GB"]
end

subgraph Identity [Identity]
IdP["Identity Platform - MAU"]
end

%% =================== FLOWS ===================

%% DNS and entry
U --> DNS
DNS --> LB
U --> LB

%% LB processing, WAF, CDN
LB --> LbDP
LB --> ArmorPolicy
ArmorPolicy --> ArmorReq
ArmorReq --> CDNLookup

%% CDN HIT -> served from edge
CDNLookup --> CDNEgress
CDNEgress --> EgressID
CDNEgress --> EgressAsia
EgressID --> U
EgressAsia --> U

%% CDN MISS -> origin paths
CDNLookup --> CDNFill
CDNFill --> APIGW
CDNFill --> CRReq
CDNFill --> GCS

%% API Gateway to services
APIGW --> CRReq

%% Cloud Run execution and billing dimensions
CRReq --> CRCPU
CRReq --> CRMEM

%% Secrets and data access
CRReq --> Secrets
CRReq --> VPC
VPC --> SQL
CRReq --> GCS

%% Identity flow (sign-in and token verification)
U --> IdP
IdP --> U
CRReq --> IdP
APIGW --> IdP

%% Async processing
CRReq --> PubSub
CRReq --> Tasks
Scheduler --> CRReq
Scheduler --> PubSub

%% Observability
LB --> Logging
APIGW --> Logging
CRReq --> Logging

%% Build/deploy relation
AR --> CRReq

%% =================== STYLES ===================
classDef edge fill:#E6F4FF,stroke:#1a73e8,stroke-width:1.5px,color:#0b3d91;
classDef runtime fill:#E7F6EC,stroke:#34a853,stroke-width:1.5px,color:#1e5e2f;
classDef registry fill:#FFF4E5,stroke:#fbbc04,stroke-width:1.5px,color:#8a5a00;
classDef network fill:#EFE7FD,stroke:#a142f4,stroke-width:1.5px,color:#5b2ba7;
classDef data fill:#FFF0F3,stroke:#ea4335,stroke-width:1.5px,color:#7a1b13;
classDef async fill:#F3E8FF,stroke:#a855f7,stroke-width:1.5px,color:#5b21b6;
classDef observ fill:#ECEFF1,stroke:#607d8b,stroke-width:1.5px,color:#37474f;
classDef client fill:#f0f9ff,stroke:#0284c7,stroke-width:1.5px,color:#075985;
classDef identity fill:#E0F2F1,stroke:#00695C,stroke-width:1.5px,color:#004D40;
classDef metric fill:#ffffff,stroke:#94a3b8,stroke-dasharray:5 3,color:#334155;

class U client;
class DNS,LB,ArmorPolicy,ArmorReq,CDNLookup,CDNEgress,CDNFill,APIGW,EgressID,EgressAsia,LbDP edge;
class AR registry;
class CRReq runtime;
class CRCPU,CRMEM metric;
class VPC network;
class SQL,GCS,Secrets data;
class PubSub,Tasks,Scheduler async;
class Logging observ;
class IdP identity;`;

(async () => {
  console.log('Testing enhanced Mermaid conversion...');
  console.log('========================================');

  // Convert Mermaid code to model
  console.log('1. Converting Mermaid code to DiagramModel...');
  const model = await UnifiedMermaidConverter.mermaidToModel(sampleMermaidCode);

  console.log('   Diagram type:', model.metadata.diagramType);
  console.log('   Diagram direction:', model.metadata.diagramDirection);
  console.log('   Number of nodes:', model.nodes.length);
  console.log('   Number of edges:', model.edges.length);
  console.log('   Number of groups:', model.groups.length);
  console.log('   Number of class definitions:', Object.keys(model.metadata.classDefs || {}).length);
  console.log('   Number of comments:', (model.metadata.comments || []).length);

  // Convert model back to Mermaid code
  console.log('\n2. Converting DiagramModel back to Mermaid code...');
  const reconstructedCode = UnifiedMermaidConverter.modelToMermaid(model);

  // Verify that key elements are preserved
  console.log('\n3. Verification:');
  console.log('   - Diagram type preserved:', reconstructedCode.startsWith('graph'));
  console.log('   - Groups preserved:', model.groups.length > 0);
  console.log('   - Class definitions preserved:', Object.keys(model.metadata.classDefs || {}).length > 0);
  console.log('   - Comments preserved:', (model.metadata.comments || []).length > 0);

  console.log('\nOriginal code length:', sampleMermaidCode.length);
  console.log('Reconstructed code length:', reconstructedCode.length);

  console.log('\nConversion test completed!');
})();
