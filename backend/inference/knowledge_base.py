
# IntelliRule - Knowledge Base

# Initial facts are stored separately in a SET.
INITIAL_FACTS = {
    "wifi_connected",
    "router_powered",
    "other_devices_online",
    "ping_ip_succeeds",
    "ping_domain_fails",
    "browser_fails",
    "airplane_mode_off",
    "ethernet_available",
    "vpn_disabled",
    "dns_lookup_fails",
}

# Rules are stored separately in a LIST.
# Each rule has conditions (AND) and one conclusion.

RULES = [
    {
        "id": "R1",
        "conditions": ["wifi_connected", "router_powered"],
        "conclusion": "local_network_available",
        "description": "Wi-Fi and router are active."
    },
    {
        "id": "R2",
        "conditions": ["local_network_available", "other_devices_online"],
        "conclusion": "router_likely_ok",
        "description": "Other devices can access the network."
    },
    {
        "id": "R3",
        "conditions": ["router_likely_ok", "ping_ip_succeeds"],
        "conclusion": "internet_reachable",
        "description": "IP connectivity is working."
    },
    {
        "id": "R4",
        "conditions": ["internet_reachable", "ping_domain_fails"],
        "conclusion": "dns_issue",
        "description": "IP works but domain resolution fails."
    },
    {
        "id": "R5",
        "conditions": ["dns_lookup_fails"],
        "conclusion": "dns_issue",
        "description": "DNS lookup failure indicates a DNS issue."
    },
    {
        "id": "R6",
        "conditions": ["dns_issue", "browser_fails"],
        "conclusion": "browsing_failure_due_to_dns",
        "description": "DNS issue explains browser failure."
    },
    {
        "id": "R7",
        "conditions": ["vpn_enabled", "browser_fails"],
        "conclusion": "vpn_related_issue",
        "description": "VPN may be responsible for browser failure."
    },
    {
        "id": "R8",
        "conditions": ["airplane_mode_on"],
        "conclusion": "wireless_disabled",
        "description": "Airplane mode disables wireless."
    },
    {
        "id": "R9",
        "conditions": ["wireless_disabled", "wifi_connected"],
        "conclusion": "wifi_configuration_conflict",
        "description": "Conflicting wireless settings detected."
    },
    {
        "id": "R10",
        "conditions": ["ethernet_connected", "internet_reachable"],
        "conclusion": "wired_connection_working",
        "description": "Ethernet connectivity is working."
    },
    {
        "id": "R11",
        "conditions": ["wifi_connected"],
        "conclusion": "wireless_interface_active",
        "description": "Wi-Fi interface is active."
    },
    {
        "id": "R12",
        "conditions": ["wireless_interface_active", "router_powered"],
        "conclusion": "wifi_link_established",
        "description": "Wireless link is established."
    },
    {
        "id": "R13",
        "conditions": ["wifi_link_established", "other_devices_online"],
        "conclusion": "shared_network_operational",
        "description": "Shared network is operational."
    },
    {
        "id": "R14",
        "conditions": ["shared_network_operational", "ping_domain_fails"],
        "conclusion": "possible_dns_outage",
        "description": "Shared network has a possible DNS outage."
    },
    {
        "id": "R15",
        "conditions": ["satellite_link_active", "satellite_gateway_online"],
        "conclusion": "satellite_link_available",
        "description": "Satellite connection is available."
    },
    {
        "id": "R16",
        "conditions": ["ping_ip_fails", "router_powered"],
        "conclusion": "possible_routing_issue",
        "description": "IP connectivity may have a routing problem."
    },
    {
        "id": "R17",
        "conditions": ["possible_routing_issue", "browser_fails"],
        "conclusion": "connectivity_failure",
        "description": "Routing problem causes connectivity failure."
    }
]
