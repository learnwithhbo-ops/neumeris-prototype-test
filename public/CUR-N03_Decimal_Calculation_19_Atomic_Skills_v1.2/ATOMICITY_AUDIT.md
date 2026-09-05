# CUR-N03 Decimal Calculation — Count-Blind Atomicity Audit

## Result

**Natural atomic skill count: 19.**

This count was not selected in advance. The audit applied one rule: a separate skill exists only when a learner can fail it for a meaningfully different reason that warrants its own mastery decision and primary repair destination. Difficulty changes inside the same method were merged.

## Why the previous 28-skill draft changed

| Previous boundary | Count-blind decision | Reason |
|---|---|---|
| Place value to hundredths / thousandths / construct notation | Merge → DEC-01 | One base-ten place-value repair; thousandths is extension of the same invariant. |
| Equivalent notation / compare / order positive decimals | Merge → DEC-02 | Trailing zeros are a comparison technique and ordering is repeated comparison, not a new repair method. |
| Add aligned places / add unequal places | Merge → DEC-05 | Same decimal-point alignment and addition method. |
| Subtract without regrouping / with regrouping | Merge → DEC-06 | Regrouping changes difficulty but not the target operation or repair destination. |
| × powers of ten / ÷ powers of ten | Merge → DEC-10 | They are inverse directions of one place-value shift relationship. |
| Multiply two decimals / factors below one | Merge → DEC-12 | Same scale model; product-below-one is a magnitude misconception inside the same operation. |
| Estimate decimal products | Remove as a DEC node | General estimation belongs to P-N20; magnitude checking remains embedded in multiplication and mixed problems. |
| Divide by decimal with integer quotient / decimal quotient | Merge → DEC-16 | Shared scaling is the same central method; quotient form changes complexity, not the skill. |
| Signed decimal multiplication/division | Add → DEC-18 | Genuine missing capability: sign-rule reasoning is distinct from positive decimal arithmetic and is required for complete signed decimal calculation coverage. |

## Final 19-skill sequence

1. **DEC-01 — Read, Write and Partition Decimals** — Read, write, construct and partition non-negative decimals to thousandths using base-ten place value and zero placeholders.
2. **DEC-02 — Compare and Order Positive Decimals** — Compare and order non-negative decimals to thousandths by aligning place values and recognising equivalent trailing-zero notation.
3. **DEC-03 — Locate and Interpolate Decimals on a Number Line** — Read, locate and interpolate non-negative decimals on number lines with equal intervals of tenths, hundredths or thousandths.
4. **DEC-04 — Compare and Order Signed Decimals** — Compare and order positive and negative decimals by combining decimal place value with direction and magnitude on the number line.
5. **DEC-05 — Add Positive Decimals** — Add non-negative decimals accurately, including unequal numbers of decimal places, by aligning place value and regrouping when needed.
6. **DEC-06 — Subtract Positive Decimals** — Subtract non-negative decimals accurately, including unequal decimal places and regrouping across zeros, when the final result is non-negative.
7. **DEC-07 — Add Signed Decimals** — Add positive and negative decimals by combining sign, direction and magnitude consistently.
8. **DEC-08 — Subtract Signed Decimals** — Subtract signed decimals, including crossing zero and subtracting a negative decimal, while preserving the original subtraction order.
9. **DEC-09 — Use Decimal Addition and Subtraction in Context** — Select and apply decimal addition or subtraction in money, measure, balance and change contexts, including one- and two-step problems.
10. **DEC-10 — Multiply and Divide Decimals by Powers of Ten** — Multiply and divide decimals by 10, 100 and 1000 using base-ten place-value shifts and inverse reasoning.
11. **DEC-11 — Multiply a Decimal by an Integer** — Multiply a positive decimal by a positive integer using repeated groups, partitioning or a reliable written method.
12. **DEC-12 — Multiply Two Decimals** — Multiply two positive decimals, including factors below one, using place-value scaling and a magnitude check.
13. **DEC-13 — Use Decimal Multiplication in Context** — Select and apply decimal multiplication in repeated-quantity, price, rectangular-area and simple scaling contexts.
14. **DEC-14 — Divide a Decimal by an Integer** — Divide a positive decimal by a positive integer to produce an exact terminating decimal quotient, using equal sharing/grouping and inverse checks.
15. **DEC-15 — Continue Division to a Terminating Decimal Quotient** — Continue whole-number division beyond the units place to express an exact terminating quotient as a decimal.
16. **DEC-16 — Divide by a Decimal** — Divide positive numbers by a decimal divisor by scaling dividend and divisor together to an equivalent easier division, including integer and decimal quotients.
17. **DEC-17 — Use Decimal Division in Context** — Select and apply decimal division in equal-sharing, unit-cost and measurement-grouping contexts and interpret the quotient appropriately.
18. **DEC-18 — Multiply and Divide Signed Decimals** — Multiply and divide signed decimals by applying sign rules separately from the positive decimal magnitude calculation.
19. **DEC-19 — Solve Mixed and Multi-Step Decimal Calculations** — Choose and sequence decimal addition, subtraction, multiplication and division independently in two- and three-step GCSE Foundation calculations and contexts.

## Ownership note

CUR-N01 already contains broad P-N14 to P-N18 decimal contracts. This pack is self-contained for implementation, but Stage 2 must choose one canonical mastery owner. Where a P-N node remains canonical, corresponding DEC nodes should be aliases/package views or approved deeper decompositions, not duplicate mastery states.

## Scope deliberately excluded

- FDP conversion remains CUR-N04.
- Percentages remain later percentage packages.
- Rounding/error intervals are not part of this package.
- Standard form is not part of this package.
- General estimation remains P-N20, although reasonableness checks are embedded in relevant Decimal lessons.
