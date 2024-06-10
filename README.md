# Klaytn CN Staking contract tests

This repo contains test code for [cn staking contract](https://github.com/klaytn/klaytn/tree/dev/contracts/cnstaking).
Using this test code, you can easily test the cn staking contract.

## Prerequisites

You need to have the following packages

- [docker](https://www.docker.com/)
- [node.js](https://nodejs.org/en)

## install npm packages

```
# npm install
```

## Getting Started

```
$ ./run.sh
```

This script will deploy a private Klaytn network on the local machine with a single CN using `docker-compose`.
Then, it performs the following actions to staking contract to test staking/unstaking:

1. Fill KLAY to the contract deployer.
1. Deploy the cn staking contract.
1. Initialize the cn staking contract.
1. **stake**
1. Submit a withdrawal. This is the first step of unstake. One of admin accounts should perform this.
1. Confirm the withdrawal. Other admin accounts should perform this.
1. **unstake** is done through `withdrawApprovedStaking()`.

Please refer to `fullExec()` in index.js to find above actions.

Note that lockup of one week of this cn staking contract is removed for testing.

