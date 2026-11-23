
def backward_chain(goal, facts, rules):
    facts = set(facts)
    trace = []

    def prove(current_goal, depth=0, ancestors=None):
        if ancestors is None:
            ancestors = set()

        indent = "  " * depth

        trace.append({
            "depth": depth,
            "goal": current_goal,
            "message": f"{indent}Trying goal: {current_goal}",
            "status": "TRYING"
        })

        if current_goal in facts:
            trace.append({
                "depth": depth,
                "goal": current_goal,
                "message": f"{indent}KNOWN FACT: {current_goal}",
                "status": "PROVEN"
            })
            return True

        if current_goal in ancestors:
            trace.append({
                "depth": depth,
                "goal": current_goal,
                "message": f"{indent}Cycle detected.",
                "status": "FAILED"
            })
            return False

        supporting_rules = [
            rule for rule in rules
            if rule["conclusion"] == current_goal
        ]

        if not supporting_rules:
            trace.append({
                "depth": depth,
                "goal": current_goal,
                "message": f"{indent}No supporting rule found.",
                "status": "FAILED"
            })
            return False

        next_ancestors = ancestors | {current_goal}

        for rule in supporting_rules:
            trace.append({
                "depth": depth,
                "goal": current_goal,
                "rule_id": rule["id"],
                "message": (
                    f"{indent}Using {rule['id']} to prove "
                    f"{current_goal}"
                ),
                "status": "RULE_SELECTED"
            })

            all_proven = True

            for subgoal in rule["conditions"]:
                result = prove(
                    subgoal,
                    depth + 1,
                    next_ancestors
                )

                if not result:
                    all_proven = False
                    break

            if all_proven:
                trace.append({
                    "depth": depth,
                    "goal": current_goal,
                    "rule_id": rule["id"],
                    "message": (
                        f"{indent}{rule['id']} succeeded. "
                        f"Goal proven: {current_goal}"
                    ),
                    "status": "PROVEN"
                })
                return True

            trace.append({
                "depth": depth,
                "goal": current_goal,
                "rule_id": rule["id"],
                "message": (
                    f"{indent}{rule['id']} failed. "
                    f"Trying another supporting rule."
                ),
                "status": "RULE_FAILED"
            })

        trace.append({
            "depth": depth,
            "goal": current_goal,
            "message": f"{indent}Goal failed: {current_goal}",
            "status": "FAILED"
        })

        return False

    result = prove(goal)

    return {
        "goal": goal,
        "result": result,
        "answer": "YES" if result else "NO",
        "trace": trace
    }
