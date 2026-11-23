
def forward_chain(initial_facts, rules):
    facts = set(initial_facts)
    trace = []
    pass_number = 1

    while True:
        new_facts_added = 0
        pass_trace = []

        for rule in rules:
            conditions = set(rule["conditions"])
            conclusion = rule["conclusion"]

            missing = sorted(conditions - facts)

            if not missing:
                if conclusion in facts:
                    status = "ALREADY_KNOWN"
                    message = (
                        f"{rule['id']} satisfied, but "
                        f"{conclusion} is already known."
                    )
                else:
                    status = "FIRED"
                    facts.add(conclusion)
                    new_facts_added += 1

                    message = (
                        f"{rule['id']} fired: "
                        f"{conclusion} added."
                    )
            else:
                status = "NOT_SATISFIED"
                message = (
                    f"{rule['id']} not satisfied. "
                    f"Missing: {', '.join(missing)}"
                )

            pass_trace.append({
                "rule_id": rule["id"],
                "conditions": rule["conditions"],
                "conclusion": conclusion,
                "status": status,
                "missing_facts": missing,
                "message": message
            })

        trace.append({
            "pass": pass_number,
            "steps": pass_trace,
            "new_facts": new_facts_added
        })

        if new_facts_added == 0:
            break

        pass_number += 1

    return {
        "final_facts": sorted(facts),
        "derived_facts": sorted(facts - set(initial_facts)),
        "passes": trace,
        "total_passes": pass_number
    }
