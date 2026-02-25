package com.edubridge.vaultservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
@Slf4j
public class CacheService {

    private final RedissonClient redissonClient;

    public <T> T executeWithLock(String lockKey, Supplier<T> supplier) {
        RLock lock = redissonClient.getLock(lockKey);
        boolean isLocked = false;
        try {
            // Wait up to 5 seconds to acquire lock, hold for 10 seconds max
            isLocked = lock.tryLock(5, 10, TimeUnit.SECONDS);
            if (isLocked) {
                log.debug("Acquired distributed lock for key: {}", lockKey);
                return supplier.get();
            } else {
                throw new IllegalStateException("Could not acquire lock for key: " + lockKey);
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Thread interrupted while waiting for lock", e);
        } finally {
            if (isLocked && lock.isHeldByCurrentThread()) {
                lock.unlock();
                log.debug("Released distributed lock for key: {}", lockKey);
            }
        }
    }
}
