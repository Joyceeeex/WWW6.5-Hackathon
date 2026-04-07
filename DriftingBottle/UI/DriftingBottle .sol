// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DriftingBottle {
    struct Bottle {
        uint256 id;
        address creator;
        string contentHash;
        uint256 timestamp;
        uint256 tipAmount; // 🆕 新增：记录该瓶子累计收到的打赏金额，用于判定“暖言”
    }

    struct Reply {
        address replier;
        string contentHash;
        uint256 timestamp;
    }

    uint256 public bottleCount;
    mapping(uint256 => Bottle) public bottles;
    mapping(uint256 => Reply[]) public replies;
    
    // 记录用户发出的瓶子ID列表
    mapping(address => uint256[]) public userBottles;
    // 🆕 新增：记录用户捡到过的瓶子ID列表（对应“收到的漂流瓶”列表）
    mapping(address => uint256[]) public pickedBottles;

    event BottleCreated(uint256 bottleId, address creator);
    event Replied(uint256 bottleId, address replier);
    event Tipped(uint256 bottleId, address from, address to, uint256 amount);

    // 🟢 创建漂流瓶
    function createBottle(string memory _contentHash) public {
        bottleCount++;
        bottles[bottleCount] = Bottle({
            id: bottleCount,
            creator: msg.sender,
            contentHash: _contentHash,
            timestamp: block.timestamp,
            tipAmount: 0 // 初始打赏为0
        });
        
        userBottles[msg.sender].push(bottleCount);
        emit BottleCreated(bottleCount, msg.sender);
    }

    // 🟡 回复漂流瓶
    function replyBottle(uint256 _bottleId, string memory _contentHash) public {
        require(_bottleId > 0 && _bottleId <= bottleCount, "Invalid bottle");
        replies[_bottleId].push(Reply({
            replier: msg.sender,
            contentHash: _contentHash,
            timestamp: block.timestamp
        }));
        emit Replied(_bottleId, msg.sender);
    }

    // 🔵 随机获取瓶子（修改：改为非 view 函数，因为要记录“捡到过”的状态）
    // 如果你不想付 Gas 费记录，可以保持 view，然后在前端存到 LocalStorage
    // 但为了黑客松展示“链上存储”，我们建议记录在链上
    function getRandomBottle() public returns (uint256 id, string memory content, address creator) {
        require(bottleCount > 0, "No bottles");
        
        // 伪随机逻辑
        uint256 randomId = (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, bottleCount))) % bottleCount) + 1;
        Bottle storage b = bottles[randomId];
        
        // 🆕 记录当前用户捡到了这个瓶子
        pickedBottles[msg.sender].push(randomId);
        
        return (b.id, b.contentHash, b.creator);
    }

    // 💰 打赏（修改：增加 bottleId 参数，这样才能统计哪个瓶子最受欢迎）
    function tip(uint256 _bottleId, address payable _to) public payable {
        require(msg.value > 0, "No value sent");
        require(_bottleId > 0 && _bottleId <= bottleCount, "Invalid bottle");

        // 增加该瓶子的打赏权重
        bottles[_bottleId].tipAmount += msg.value;
        
        // 转账给接收者
        _to.transfer(msg.value);

        emit Tipped(_bottleId, msg.sender, _to, msg.value);
    }

    // --- 辅助查询函数 ---

    // 获取某个瓶子的所有回复
    function getAllReplies(uint256 _bottleId) public view returns (Reply[] memory) {
        return replies[_bottleId];
    }

    // 获取用户发出的所有瓶子ID
    function getUserBottles(address _user) public view returns (uint256[] memory) {
        return userBottles[_user];
    }

    // 获取用户捡到过的所有瓶子ID
    function getPickedBottles(address _user) public view returns (uint256[] memory) {
        return pickedBottles[_user];
    }

    // 获取所有瓶子（前端可以根据 tipAmount 排序筛选出“暖言”）
    // 在黑客松中，通常在前端进行这种展示逻辑的过滤
    function getWarmBottles(uint256 _minTip) public view returns (Bottle[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= bottleCount; i++) {
            if (bottles[i].tipAmount >= _minTip) {
                count++;
            }
        }
        
        Bottle[] memory warmOnes = new Bottle[](count);
        uint256 index = 0;
        for (uint256 i = 1; i <= bottleCount; i++) {
            if (bottles[i].tipAmount >= _minTip) {
                warmOnes[index] = bottles[i];
                index++;
            }
        }
        return warmOnes;
    }
}