package com.expensetracker.controller;

import com.expensetracker.dto.MyBalanceSummary;
import com.expensetracker.service.BalanceService;
import com.expensetracker.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/balances")
@RequiredArgsConstructor
public class MyBalanceController {

    private final BalanceService balanceService;

    @GetMapping("/me")
    public ResponseEntity<MyBalanceSummary> getMyBalance() {
        return ResponseEntity.ok(balanceService.computeMyBalanceSummary(SecurityUtils.currentUserId()));
    }
}
