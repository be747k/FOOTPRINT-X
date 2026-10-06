#!/usr/bin/env python3
"""
=============================================================================
FOOTPRINT-X: Automated Surface Exposure & Digital Footprint Analyzer
Academic Laboratory Mini-Project Engine | IoTCSBCL704
=============================================================================
Author: Senior Cybersecurity Engineer & Lead Python Developer
Target Curriculum: IoTCSBCL704 Lab Experiments 1, 2, 5, 6, 7, 8, 12

Core Capabilities:
  - Module 1: Network & IP Geolocation Mapper (DNS, Reverse DNS, GeoIP, ASN)
  - Module 2: Web Server & Technology Stack Fingerprinting (Headers, CSP, HSTS, SSL)
  - Module 3: Subdomain Reconnaissance via CRT.sh Certificate Transparency
  - Module 4: Digital Identity & Social Account Surface Correlation
  - Risk Engine: CVSS-Weighted Exposure Scoring (0-100 scale) & Remediation Directives
=============================================================================
"""

import sys
import json
import socket
import ssl
import re
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime
from typing import Dict, List, Any, Optional

USER_AGENT = "FOOTPRINT-X/2.4-Academic-OSINT (Lab-IoTCSBCL704; Educational Surface Scanner)"


class NetworkReconModule:
    """
    Exp 1: Information Gathering & Passive Reconnaissance
    Performs DNS resolution, reverse PTR resolution, and queries GeoIP / ASN metadata.
    """

    @staticmethod
    def resolve_target(target: str) -> Dict[str, Any]:
        result = {
            "target": target,
            "ip_addresses": [],
            "reverse_dns": None,
            "geoip": {},
            "status": "pending",
            "error": None
        }

        # Normalize target
        clean_target = re.sub(r"^https?://", "", target).split("/")[0].split(":")[0].strip()
        result["clean_target"] = clean_target

        # Check if clean_target is already an IP
        is_ip = bool(re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", clean_target))

        try:
            if is_ip:
                result["ip_addresses"] = [clean_target]
                try:
                    rev_name, _, _ = socket.gethostbyaddr(clean_target)
                    result["reverse_dns"] = rev_name
                except Exception:
                    result["reverse_dns"] = None
            else:
                # DNS forward lookup
                _, _, ips = socket.gethostbyname_ex(clean_target)
                result["ip_addresses"] = list(set(ips)) if ips else []
                if result["ip_addresses"]:
                    try:
                        rev_name, _, _ = socket.gethostbyaddr(result["ip_addresses"][0])
                        result["reverse_dns"] = rev_name
                    except Exception:
                        result["reverse_dns"] = None
        except Exception as e:
            result["error"] = f"DNS Resolution failed: {str(e)}"
            return result

        # GeoIP Lookup for Primary IP
        primary_ip = result["ip_addresses"][0] if result["ip_addresses"] else None
        if primary_ip:
            try:
                geoip_url = f"http://ip-api.com/json/{primary_ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query"
                req = urllib.request.Request(geoip_url, headers={"User-Agent": USER_AGENT})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    if resp.status == 200:
                        geo_data = json.loads(resp.read().decode("utf-8"))
                        if geo_data.get("status") == "success":
                            result["geoip"] = {
                                "ip": geo_data.get("query", primary_ip),
                                "country": geo_data.get("country", "Unknown"),
                                "country_code": geo_data.get("countryCode", "??"),
                                "region": geo_data.get("regionName", "Unknown"),
                                "city": geo_data.get("city", "Unknown"),
                                "zip": geo_data.get("zip", "N/A"),
                                "latitude": geo_data.get("lat", 0.0),
                                "longitude": geo_data.get("lon", 0.0),
                                "timezone": geo_data.get("timezone", "UTC"),
                                "isp": geo_data.get("isp", "Unknown ISP"),
                                "org": geo_data.get("org", "Unknown Org"),
                                "as": geo_data.get("as", "Unknown ASN")
                            }
            except Exception as e:
                result["geoip"] = {
                    "ip": primary_ip,
                    "error": f"GeoIP query failed: {str(e)}",
                    "country": "Unknown",
                    "city": "Unknown",
                    "isp": "Local / Private Network"
                }

        result["status"] = "success"
        return result


class WebStackFingerprintModule:
    """
    Exp 5 & Exp 6: Web Application Reconnaissance & Security Header Analysis
    Evaluates HTTP response headers, Server banner leaks, HSTS, CSP, and TLS parameters.
    """

    @staticmethod
    def inspect_stack(target: str) -> Dict[str, Any]:
        clean_target = re.sub(r"^https?://", "", target).split("/")[0].strip()
        result = {
            "target": clean_target,
            "url_probed": f"https://{clean_target}",
            "http_status": None,
            "server_header": None,
            "x_powered_by": None,
            "security_headers": {},
            "raw_headers": {},
            "ssl_info": {},
            "detected_technologies": [],
            "status": "pending",
            "error": None
        }

        # Try HTTPS first, fallback to HTTP
        headers_found = False
        for proto in ["https", "http"]:
            probe_url = f"{proto}://{clean_target}"
            req = urllib.request.Request(
                probe_url,
                headers={"User-Agent": USER_AGENT, "Accept": "*/*"}
            )
            # Create unverified context for defensive analysis so self-signed certs still return headers
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE

            try:
                with urllib.request.urlopen(req, timeout=6, context=ctx) as response:
                    result["http_status"] = response.status
                    result["url_probed"] = probe_url
                    headers_dict = dict(response.info().items())
                    result["raw_headers"] = {k.lower(): v for k, v in headers_dict.items()}
                    headers_found = True
                    break
            except urllib.error.HTTPError as e:
                result["http_status"] = e.code
                result["url_probed"] = probe_url
                headers_dict = dict(e.headers.items()) if e.headers else {}
                result["raw_headers"] = {k.lower(): v for k, v in headers_dict.items()}
                headers_found = True
                break
            except Exception:
                continue

        if not headers_found:
            result["error"] = "Target host did not return HTTP/HTTPS response within timeout."
            result["status"] = "failed"
            return result

        raw = result["raw_headers"]
        result["server_header"] = raw.get("server", "Hidden / Not Disclosed")
        result["x_powered_by"] = raw.get("x-powered-by", None)

        # Inspect Security Headers
        result["security_headers"] = {
            "strict_transport_security": {
                "present": "strict-transport-security" in raw,
                "value": raw.get("strict-transport-security"),
                "recommendation": "Enforce Strict-Transport-Security with max-age >= 31536000 and includeSubDomains."
            },
            "content_security_policy": {
                "present": "content-security-policy" in raw,
                "value": raw.get("content-security-policy"),
                "recommendation": "Define a restrictive Content-Security-Policy to mitigate XSS and data exfiltration."
            },
            "x_frame_options": {
                "present": "x-frame-options" in raw,
                "value": raw.get("x-frame-options"),
                "recommendation": "Configure X-Frame-Options: DENY or SAMEORIGIN to prevent Clickjacking attacks."
            },
            "x_content_type_options": {
                "present": "x-content-type-options" in raw,
                "value": raw.get("x-content-type-options"),
                "recommendation": "Set X-Content-Type-Options: nosniff to stop MIME-type sniffing."
            },
            "referrer_policy": {
                "present": "referrer-policy" in raw,
                "value": raw.get("referrer-policy"),
                "recommendation": "Set Referrer-Policy: strict-origin-when-cross-origin."
            },
            "permissions_policy": {
                "present": "permissions-policy" in raw,
                "value": raw.get("permissions-policy"),
                "recommendation": "Specify Permissions-Policy to restrict sensitive browser APIs (camera, geolocation)."
            }
        }

        # Technology Detection Heuristics
        techs = []
        server_str = (result["server_header"] or "").lower()
        if "cloudflare" in server_str or "cf-ray" in raw:
            techs.append("Cloudflare CDN / Edge WAF")
        if "nginx" in server_str:
            techs.append("Nginx Web Server")
        if "apache" in server_str:
            techs.append("Apache HTTP Server")
        if "litespeed" in server_str:
            techs.append("LiteSpeed Web Server")
        if "microsoft-iis" in server_str:
            techs.append("Microsoft IIS")
        if "vercel" in server_str or "x-vercel-id" in raw:
            techs.append("Vercel Serverless Edge")
        if "netlify" in server_str or "x-nf-request-id" in raw:
            techs.append("Netlify Platform")
        if "caddy" in server_str:
            techs.append("Caddy Web Server")

        x_pow = (result["x_powered_by"] or "").lower()
        if "express" in x_pow or "node" in x_pow:
            techs.append("Node.js / Express Engine")
        if "php" in x_pow:
            techs.append(f"PHP Backend ({result['x_powered_by']})")
        if "next.js" in x_pow:
            techs.append("Next.js React Framework")
        if "asp.net" in x_pow:
            techs.append("ASP.NET Framework")

        result["detected_technologies"] = list(set(techs))

        # SSL/TLS Certificate Metadata Inspection
        try:
            port = 443
            context = ssl.create_default_context()
            with socket.create_connection((clean_target, port), timeout=4) as sock:
                with context.wrap_socket(sock, server_hostname=clean_target) as ssock:
                    cert = ssock.getpeercert()
                    cipher = ssock.cipher()
                    proto_ver = ssock.version()
                    
                    # Extract SANs (Subject Alternative Names)
                    sans = []
                    for item in cert.get("subjectAltName", []):
                        if item[0] == "DNS":
                            sans.append(item[1])

                    # Extract Issuer
                    issuer_parts = []
                    for rdn in cert.get("issuer", ()):
                        for attr, val in rdn:
                            if attr == "organizationName" or attr == "commonName":
                                issuer_parts.append(val)

                    result["ssl_info"] = {
                        "protocol": proto_ver,
                        "cipher_suite": cipher[0] if cipher else "Unknown",
                        "issuer": " / ".join(issuer_parts) if issuer_parts else "Unknown CA",
                        "subject": dict(x[0] for x in cert.get("subject", ())),
                        "not_after": cert.get("notAfter"),
                        "not_before": cert.get("notBefore"),
                        "subject_alt_names_count": len(sans),
                        "subject_alt_names": sans[:15]
                    }
        except Exception as e:
            result["ssl_info"] = {
                "active_tls": False,
                "notes": f"Direct TLS handshake failed or non-standard port: {str(e)}"
            }

        result["status"] = "success"
        return result


class SubdomainReconModule:
    """
    Exp 2: Footprinting via Search Engines & Public Databases (Certificate Transparency)
    Fetches publicly registered subdomains via crt.sh API and catalogs attack surface exposure.
    """

    @staticmethod
    def enumerate_subdomains(domain: str) -> Dict[str, Any]:
        clean_domain = re.sub(r"^https?://", "", domain).split("/")[0].strip()
        result = {
            "domain": clean_domain,
            "subdomains": [],
            "total_found": 0,
            "high_risk_subdomains": [],
            "source": "CRT.sh Certificate Transparency Logs",
            "status": "pending",
            "error": None
        }

        # Query CRT.sh public JSON endpoint
        crt_url = f"https://crt.sh/?q=%25.{urllib.parse.quote(clean_domain)}&output=json"
        req = urllib.request.Request(crt_url, headers={"User-Agent": USER_AGENT})

        try:
            with urllib.request.urlopen(req, timeout=8) as response:
                if response.status == 200:
                    raw_data = json.loads(response.read().decode("utf-8"))
                    raw_subs = set()
                    for item in raw_data:
                        name_value = item.get("name_value", "")
                        for line in name_value.split("\n"):
                            line = line.strip().lower()
                            # remove leading wildcards like *.
                            line = re.sub(r"^\*\.", "", line)
                            if line and clean_domain in line and not line.startswith("@"):
                                raw_subs.add(line)

                    sub_list = sorted(list(raw_subs))
                    result["total_found"] = len(sub_list)

                    # Identify high risk surface prefixes
                    high_risk_patterns = [
                        "admin", "dev", "test", "staging", "api", "internal", "vpn",
                        "mail", "portal", "corp", "auth", "login", "jenkins", "gitlab",
                        "database", "db", "stage", "preview"
                    ]
                    
                    classified = []
                    for s in sub_list:
                        prefix = s.split(".")[0]
                        is_sensitive = any(pat in prefix for pat in high_risk_patterns)
                        item_record = {
                            "fqdn": s,
                            "classification": "High Risk Surface" if is_sensitive else "Standard Subdomain",
                            "is_high_risk": is_sensitive
                        }
                        classified.append(item_record)
                        if is_sensitive and len(result["high_risk_subdomains"]) < 20:
                            result["high_risk_subdomains"].append(s)

                    result["subdomains"] = classified[:100]  # Cap at top 100 for responsive payload
                    result["status"] = "success"
        except urllib.error.URLError as e:
            result["error"] = f"CRT.sh query timed out or unreachable ({str(e)}). Target domain may have heavy certificate logs."
            result["status"] = "warning"
        except Exception as e:
            result["error"] = f"Failed to parse Certificate Transparency logs: {str(e)}"
            result["status"] = "failed"

        return result


class IdentityReconModule:
    """
    Exp 7: Identity & Digital Footprint Correlation
    Scans public social endpoints and developer networks for username footprint discovery.
    """

    TARGET_PLATFORMS = [
        {
            "name": "GitHub",
            "url_pattern": "https://github.com/{username}",
            "api_endpoint": "https://api.github.com/users/{username}",
            "category": "Developer & Code Repositories"
        },
        {
            "name": "Reddit",
            "url_pattern": "https://www.reddit.com/user/{username}",
            "api_endpoint": "https://www.reddit.com/user/{username}/about.json",
            "category": "Social & Discussions"
        },
        {
            "name": "HackerNews",
            "url_pattern": "https://news.ycombinator.com/user?id={username}",
            "api_endpoint": "https://hacker-news.firebaseio.com/v0/user/{username}.json",
            "category": "Tech Forum"
        },
        {
            "name": "GitLab",
            "url_pattern": "https://gitlab.com/{username}",
            "api_endpoint": "https://gitlab.com/api/v4/users?username={username}",
            "category": "Developer & DevOps"
        },
        {
            "name": "Dev.to",
            "url_pattern": "https://dev.to/{username}",
            "api_endpoint": "https://dev.to/api/users/by_username?url={username}",
            "category": "Developer Community"
        },
        {
            "name": "Keybase",
            "url_pattern": "https://keybase.io/{username}",
            "api_endpoint": "https://keybase.io/_/api/1.0/user/lookup.json?usernames={username}",
            "category": "Cryptographic Identity & PGP"
        }
    ]

    @staticmethod
    def scan_username(username: str) -> Dict[str, Any]:
        clean_user = username.strip().replace("@", "")
        result = {
            "username": clean_user,
            "profiles_found": [],
            "total_scanned": len(IdentityReconModule.TARGET_PLATFORMS),
            "match_count": 0,
            "status": "pending"
        }

        if not clean_user:
            result["status"] = "skipped"
            return result

        matches = []
        for plat in IdentityReconModule.TARGET_PLATFORMS:
            api_url = plat["api_endpoint"].format(username=clean_user)
            profile_url = plat["url_pattern"].format(username=clean_user)
            req = urllib.request.Request(api_url, headers={"User-Agent": USER_AGENT})

            try:
                with urllib.request.urlopen(req, timeout=4) as resp:
                    if resp.status == 200:
                        content = resp.read().decode("utf-8")
                        try:
                            data = json.loads(content)
                            # Verify platform specific valid matches
                            is_valid = True
                            bio_or_summary = ""
                            if plat["name"] == "GitHub":
                                if "message" in data and data["message"] == "Not Found":
                                    is_valid = False
                                else:
                                    bio_or_summary = f"{data.get('name') or clean_user} | Repos: {data.get('public_repos', 0)}"
                            elif plat["name"] == "Reddit":
                                if data.get("data", {}).get("is_suspended") or "name" not in data.get("data", {}):
                                    is_valid = False
                                else:
                                    bio_or_summary = f"Karma: {data.get('data', {}).get('total_karma', 0)}"
                            elif plat["name"] == "HackerNews":
                                if not data or data.get("id") is None:
                                    is_valid = False
                                else:
                                    bio_or_summary = f"Karma: {data.get('karma', 0)}"
                            elif plat["name"] == "GitLab":
                                if not isinstance(data, list) or len(data) == 0:
                                    is_valid = False
                                else:
                                    bio_or_summary = data[0].get("name", "")
                            elif plat["name"] == "Keybase":
                                them = data.get("them", [])
                                if not them or them[0] is None:
                                    is_valid = False
                                else:
                                    bio_or_summary = "Verified Cryptographic Keybase Identity"

                            if is_valid:
                                matches.append({
                                    "platform": plat["name"],
                                    "category": plat["category"],
                                    "profile_url": profile_url,
                                    "status": "Verified Active Profile",
                                    "metadata": bio_or_summary
                                })
                        except json.JSONDecodeError:
                            pass
            except urllib.error.HTTPError:
                # 404 means user does not exist on this platform
                continue
            except Exception:
                continue

        result["profiles_found"] = matches
        result["match_count"] = len(matches)
        result["status"] = "success"
        return result


class ExposureRiskEngine:
    """
    Exp 8: Exposure Risk Scoring & Threat Modeling
    Calculates unified Risk Score on 0-100 scale (where 100 = critical exposure, 0 = hardened).
    Generates structured vulnerability observation findings and actionable remediation directives.
    """

    @staticmethod
    def calculate_risk(
        net_data: Dict[str, Any],
        web_data: Dict[str, Any],
        sub_data: Dict[str, Any],
        id_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        score = 15  # Baseline passive exposure
        findings: List[Dict[str, Any]] = []

        # 1. Security Headers Audit
        sec_headers = web_data.get("security_headers", {})

        # HSTS Check
        hsts = sec_headers.get("strict_transport_security", {})
        if not hsts.get("present"):
            score += 15
            findings.append({
                "severity": "HIGH",
                "cvss_score": 7.4,
                "title": "Missing HTTP Strict Transport Security (HSTS)",
                "category": "Transport Layer Security",
                "impact": "Vulnerable to SSL-stripping and Man-in-the-Middle (MitM) downgrade attacks.",
                "remediation": "Configure 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' in web server config."
            })

        # Content-Security-Policy (CSP) Check
        csp = sec_headers.get("content_security_policy", {})
        if not csp.get("present"):
            score += 15
            findings.append({
                "severity": "HIGH",
                "cvss_score": 7.1,
                "title": "Missing Content-Security-Policy (CSP) Header",
                "category": "Application Layer Defense",
                "impact": "Absence of CSP significantly increases risk of Cross-Site Scripting (XSS) and code injection.",
                "remediation": "Deploy a strict Content-Security-Policy restricting script-src, object-src, and base-uri directives."
            })

        # X-Frame-Options Check
        xfo = sec_headers.get("x_frame_options", {})
        if not xfo.get("present"):
            score += 10
            findings.append({
                "severity": "MEDIUM",
                "cvss_score": 5.4,
                "title": "Missing X-Frame-Options Header",
                "category": "UI Redressing / Clickjacking",
                "impact": "Web application can be framed into malicious parent iframes, enabling Clickjacking attacks.",
                "remediation": "Set 'X-Frame-Options: DENY' or 'X-Frame-Options: SAMEORIGIN' across all public endpoints."
            })

        # X-Content-Type-Options Check
        xcto = sec_headers.get("x_content_type_options", {})
        if not xcto.get("present"):
            score += 8
            findings.append({
                "severity": "LOW",
                "cvss_score": 3.7,
                "title": "Missing X-Content-Type-Options Header",
                "category": "MIME Sniffing Vulnerability",
                "impact": "Browsers may sniff response content types, rendering non-executable assets as executable HTML/JS.",
                "remediation": "Add 'X-Content-Type-Options: nosniff' header."
            })

        # 2. Technology Banner Disclosure Audit
        server_hdr = web_data.get("server_header")
        if server_hdr and server_hdr not in ["Hidden / Not Disclosed", "cloudflare", ""]:
            # Check for version numbers in server banner
            if re.search(r"\d+\.\d+", server_hdr):
                score += 12
                findings.append({
                    "severity": "MEDIUM",
                    "cvss_score": 5.3,
                    "title": f"Explicit Server Banner Version Disclosure ({server_hdr})",
                    "category": "Information Disclosure",
                    "impact": "Attackers can correlate exact version numbers with known CVE exploit databases.",
                    "remediation": "Disable server version tokens (e.g., 'ServerTokens Prod' in Apache or 'server_tokens off;' in Nginx)."
                })
            else:
                score += 6
                findings.append({
                    "severity": "LOW",
                    "cvss_score": 2.6,
                    "title": f"Server Software Fingerprint Disclosed ({server_hdr})",
                    "category": "Information Disclosure",
                    "impact": "Aids targeted reconnaissance during attacker profiling phase.",
                    "remediation": "Strip the 'Server' header using a reverse proxy or edge middleware."
                })

        x_powered = web_data.get("x_powered_by")
        if x_powered:
            score += 10
            findings.append({
                "severity": "MEDIUM",
                "cvss_score": 5.0,
                "title": f"Application Framework Header Leaked (X-Powered-By: {x_powered})",
                "category": "Technology Fingerprinting",
                "impact": "Reveals underlying application runtime framework to reconnaissance tools.",
                "remediation": "Remove the X-Powered-By header in application framework config."
            })

        # 3. Subdomain Surface Exposure Audit
        high_risk_subs = sub_data.get("high_risk_subdomains", [])
        if len(high_risk_subs) > 0:
            score += min(18, 5 * len(high_risk_subs))
            findings.append({
                "severity": "HIGH" if len(high_risk_subs) >= 3 else "MEDIUM",
                "cvss_score": 6.8 if len(high_risk_subs) >= 3 else 4.9,
                "title": f"Sensitive Subdomains Exposed in Public CT Logs ({len(high_risk_subs)} found)",
                "category": "Attack Surface Exposure",
                "impact": f"Detected sensitive endpoints such as: {', '.join(high_risk_subs[:4])}. Often expose pre-production vulnerabilities.",
                "remediation": "Place staging/dev/admin portals behind internal Zero-Trust access proxies (e.g. Tailscale or Cloudflare Access)."
            })

        # 4. Identity Footprint Correlation
        matched_profiles = id_data.get("profiles_found", [])
        if len(matched_profiles) >= 3:
            score += 8
            findings.append({
                "severity": "LOW",
                "cvss_score": 3.1,
                "title": f"High Digital Identity Correlation ({len(matched_profiles)} public accounts)",
                "category": "Human OSINT & Social Engineering",
                "impact": "Broad cross-platform digital presence provides attackers with ample social engineering reconnaissance.",
                "remediation": "Segregate organizational administrative handles from personal public developer handles."
            })

        # Normalize score between 0 and 100
        final_score = min(100, max(0, score))

        # Risk Classification Level
        if final_score >= 75:
            risk_level = "CRITICAL RISK"
            color_theme = "#ef4444"
        elif final_score >= 50:
            risk_level = "HIGH RISK"
            color_theme = "#f97316"
        elif final_score >= 25:
            risk_level = "MEDIUM RISK"
            color_theme = "#eab308"
        else:
            risk_level = "LOW / HARDENED"
            color_theme = "#10b981"

        return {
            "score": final_score,
            "risk_level": risk_level,
            "color_theme": color_theme,
            "findings_count": len(findings),
            "findings": findings,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }


def run_full_recon(target: str, username: Optional[str] = None) -> Dict[str, Any]:
    """Orchestrates all 4 laboratory reconnaissance modules and compiles risk assessment."""
    net_data = NetworkReconModule.resolve_target(target)
    web_data = WebStackFingerprintModule.inspect_stack(target)
    sub_data = SubdomainReconModule.enumerate_subdomains(target)
    id_data = IdentityReconModule.scan_username(username or "")

    risk_data = ExposureRiskEngine.calculate_risk(net_data, web_data, sub_data, id_data)

    return {
        "metadata": {
            "application": "FOOTPRINT-X",
            "version": "2.4-Academic",
            "curriculum": "IoTCSBCL704",
            "engine": "Python Core OSINT Engine",
            "scan_timestamp": datetime.utcnow().isoformat() + "Z",
            "target": target,
            "username": username or "N/A"
        },
        "network_recon": net_data,
        "web_stack": web_data,
        "subdomain_recon": sub_data,
        "identity_recon": id_data,
        "risk_assessment": risk_data
    }


def main():
    import argparse
    parser = argparse.ArgumentParser(
        description="FOOTPRINT-X: Automated Surface Exposure & Digital Footprint Analyzer (IoTCSBCL704)"
    )
    parser.add_argument("--target", "-t", required=True, help="Target domain or IP address (e.g., example.com)")
    parser.add_argument("--username", "-u", default=None, help="Target username or social handle for identity correlation")
    parser.add_argument("--json", action="store_true", help="Output raw JSON scan results")
    parser.add_argument("--lab-exp", type=int, choices=[1, 2, 5, 6, 7, 8, 12], help="Run specific academic experiment module")

    args = parser.parse_args()

    if args.lab_exp == 1:
        data = NetworkReconModule.resolve_target(args.target)
    elif args.lab_exp == 2:
        data = SubdomainReconModule.enumerate_subdomains(args.target)
    elif args.lab_exp in [5, 6]:
        data = WebStackFingerprintModule.inspect_stack(args.target)
    elif args.lab_exp == 7:
        data = IdentityReconModule.scan_username(args.username or args.target)
    else:
        data = run_full_recon(args.target, args.username)

    if args.json or True:
        print(json.dumps(data, indent=2))


if __name__ == "__main__":
    main()
