package com.expensetracker.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * A single user's net balance aggregated across every group they belong to.
 * Positive netBalance overall = owed money overall. Negative = owes money overall.
 */
public record MyBalanceSummary(
        BigDecimal totalOwedToMe,
        BigDecimal totalIOwe,
        BigDecimal netBalance,
        List<GroupBalance> byGroup
) {
    public record GroupBalance(Long groupId, String groupName, BigDecimal netBalance) {}
}
