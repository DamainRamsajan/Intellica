package agent.guardrail

import rego.v1

default allow := false

high_impact_tools := {"send_external_email", "delete_record", "transfer_funds", "modify_iam_policy"}

# Block when untrusted external input taints the context and the action is an external write or egress
deny_tainted_egress if {
	input.context.tainted_by_untrusted_source == true
	input.action.egress_or_external_write == true
}

# A high-impact action needs an approval bound to this user, this exact action and its arguments, and not yet expired
valid_approval if {
	input.approval.approved == true
	input.approval.subject == input.agent.user_id
	input.approval.action_hash == input.action.canonical_hash
	input.approval.expires_at > input.context.now_epoch
}

# Low-impact tools
allow if {
	input.auth.audience_valid == true
	input.auth.token_passthrough == false
	not deny_tainted_egress
	not high_impact_tools[input.action.tool_name]
}

# High-impact tools
allow if {
	input.auth.audience_valid == true
	input.auth.token_passthrough == false
	not deny_tainted_egress
	high_impact_tools[input.action.tool_name]
	valid_approval
}
