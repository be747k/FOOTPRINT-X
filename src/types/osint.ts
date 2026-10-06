export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface GeoIpData {
  ip: string;
  country: string;
  country_code?: string;
  region?: string;
  city: string;
  zip?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  isp: string;
  org?: string;
  as?: string;
  error?: string;
}

export interface MxRecord {
  exchange: string;
  priority: number;
}

export interface NetworkReconData {
  target: string;
  ip_addresses: string[];
  ipv6_addresses?: string[];
  reverse_dns: string | null;
  mx_records?: MxRecord[];
  txt_records?: string[];
  ns_records?: string[];
  cname_records?: string[];
  soa_record?: any;
  geoip: GeoIpData | null;
  dns_records_count?: number;
  status: 'pending' | 'success' | 'warning' | 'failed';
  error?: string | null;
}

export interface SecurityHeaderItem {
  present: boolean;
  value: string | null;
  recommendation: string;
  severity_if_missing?: string;
}

export interface SslInfo {
  valid?: boolean;
  issuer?: string;
  subject?: string;
  protocol?: string;
  cipher?: string;
  valid_from?: string | null;
  valid_to?: string | null;
  days_remaining?: number | null;
  subject_alt_names?: string[];
  subject_alt_names_count?: number;
  error?: string;
}

export interface WebStackData {
  target: string;
  url_probed: string;
  http_status: number | null;
  server_header: string | null;
  x_powered_by: string | null;
  security_headers: Record<string, SecurityHeaderItem>;
  raw_headers: Record<string, string>;
  ssl_info: SslInfo | null;
  detected_technologies: string[];
  status: 'pending' | 'success' | 'warning' | 'failed';
  error?: string | null;
}

export interface SubdomainItem {
  fqdn: string;
  classification: string;
  is_high_risk: boolean;
}

export interface SubdomainData {
  domain: string;
  subdomains: SubdomainItem[];
  total_found: number;
  high_risk_subdomains: string[];
  source: string;
  status: 'pending' | 'success' | 'warning' | 'failed';
  error?: string | null;
}

export interface IdentityProfile {
  platform: string;
  category: string;
  profile_url: string;
  status: string;
  title?: string;
  details?: string;
  avatar?: string | null;
  metadata?: string;
}

export interface IdentityData {
  username: string;
  profiles_found: IdentityProfile[];
  total_scanned: number;
  match_count: number;
  status: 'pending' | 'success' | 'skipped' | 'failed';
}

export interface RiskFinding {
  id?: string;
  severity: SeverityLevel;
  cvss: number;
  title: string;
  category: string;
  impact: string;
  remediation: string;
}

export interface RiskAssessmentData {
  score: number;
  risk_level: string;
  badge_color?: string;
  color_theme?: string;
  findings_count: number;
  findings: RiskFinding[];
  assessment_date?: string;
  timestamp?: string;
}

export interface ScanMetadata {
  application: string;
  version: string;
  curriculum: string;
  engine: string;
  scan_timestamp: string;
  target: string;
  username: string;
}

export interface FullScanResult {
  metadata: ScanMetadata;
  network_recon: NetworkReconData;
  web_stack: WebStackData;
  subdomain_recon: SubdomainData;
  identity_recon: IdentityData;
  risk_assessment: RiskAssessmentData;
}

export interface LabExperiment {
  id: string;
  exp_number: number;
  title: string;
  module_name: string;
  objective: string;
  theory: string;
  tools_mapped: string[];
  evaluation_rubric: string;
}
