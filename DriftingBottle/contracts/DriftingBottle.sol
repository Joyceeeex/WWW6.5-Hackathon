// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DriftingBottle {
    struct Bottle {
        uint256 id;
        address creator;
        string contentHash;
        uint256 timestamp;
        uint256 tipAmount;
    }

    struct Reply {
        address replier;
        string contentHash;
        uint256 timestamp;
    }

    uint256 public bottleCount;
    mapping(uint256 => Bottle) public bottles;
    mapping(uint256 => Reply[]) public replies;
    mapping(address => uint256[]) public userBottles;      // 我发出的瓶子ID
    mapping(address => uint256[]) public pickedBottles;    // 我捡到的瓶子ID

    event BottleCreated(uint256 bottleId, address creator);
    event Replied(uint256 bottleId, address replier);
    event Tipped(uint256 bottleId, address from, address to, uint256 amount);

    // 1. 发送
    function createBottle(string memory _contentHash) public {
        bottleCount++;
        bottles[bottleCount] = Bottle(bottleCount, msg.sender, _contentHash, block.timestamp, 0);
        userBottles[msg.sender].push(bottleCount);
        emit BottleCreated(bottleCount, msg.sender);
    }

    // 2. 随机捞取 (为了方便前端获取数据，我们将记录逻辑和查询分开)
    // 这是一个非view函数，因为我们要记录“捡到了”
    function pickBottle() public returns (uint256) {
        require(bottleCount > 0, "No bottles");
        uint256 randomId = (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, bottleCount))) % bottleCount) + 1;
        pickedBottles[msg.sender].push(randomId);
        return randomId;
    }

    // 3. 回复
    function replyBottle(uint256 _bottleId, string memory _contentHash) public {
        replies[_bottleId].push(Reply(msg.sender, _contentHash, block.timestamp));
        emit Replied(_bottleId, msg.sender);
    }

    // 4. 打赏
    function tip(uint256 _bottleId, address payable _to) public payable {
        require(msg.value > 0, "Zero amount");
        bottles[_bottleId].tipAmount += msg.value;
        _to.transfer(msg.value);
        emit Tipped(_bottleId, msg.sender, _to, msg.value);
    }

    // --- 批量查询辅助函数 ---
    function getUserBottles(address _u) public view returns (uint256[] memory) { return userBottles[_u]; }
    function getPickedBottles(address _u) public view returns (uint256[] memory) { return pickedBottles[_u]; }
    function getAllReplies(uint256 _id) public view returns (Reply[] memory) { return replies[_id]; }
}