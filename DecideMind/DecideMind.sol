// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract MindOnChain {
    // 定义一个结构，存储一条思考记录
    struct Record {
        string contentHash; // 存储分析结果的哈希值（短字符串）
        uint256 timestamp;  // 存储时间
    }

    // 映射：钱包地址 => 该用户的所有思考记录数组
    mapping(address => Record[]) public userRecords;

    // 公开函数：保存思考记录
    function saveRecord(string calldata _hash) external {
        userRecords[msg.sender].push(Record({
            contentHash: _hash,
            timestamp: block.timestamp
        }));
    }

    // 公开函数：获取自己的所有记录
    function getRecords(address _user) external view returns (Record[] memory) {
        return userRecords[_user];
    }
}