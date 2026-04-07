import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./constants";
import "./App.css";

// 漂流瓶图标组件
const DriftingBottleIcon = () => (
  <svg className="floating-bottle-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path fill="#E0F7FA" d="M40,20 Q40,10 50,10 Q60,10 60,20 L60,30 Q80,35 80,60 L80,80 Q80,90 70,90 L30,90 Q20,90 20,80 L20,60 Q20,35 40,30 Z" />
    <path fill="#81D4FA" d="M25,65 Q50,60 75,65 L75,80 Q75,85 70,85 L30,85 Q25,85 25,80 Z" />
    <rect x="45" y="5" width="10" height="10" rx="2" fill="#8D6E63" />
    <path d="M45,45 L55,45 L55,65 L45,65 Z" fill="#FFF9C4" opacity="0.8" />
  </svg>
);

function App() {
  const [wallet, setWallet] = useState(null);
  const [activeTab, setActiveTab] = useState("bottle"); 
  const [loading, setLoading] = useState(false);
  const [currentBottle, setCurrentBottle] = useState(null);
  const [mySentBottles, setMySentBottles] = useState([]); 
  const [myPickedBottles, setMyPickedBottles] = useState([]); 
  const [warmWords, setWarmWords] = useState([]);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("请安装 MetaMask");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
    } catch (err) { console.error(err); }
  };

  const getContract = async () => {
    if (!window.ethereum) return null;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  };

  const sendBottle = async () => {
    const input = document.getElementById("msgInput");
    if (!input.value) return alert("请输入内容");
    try {
      const contract = await getContract();
      const tx = await contract.createBottle(input.value);
      await tx.wait();
      alert("瓶子已扔进大海！");
      input.value = "";
    } catch (err) { alert("发送失败"); }
  };

  const pickRandomBottle = async () => {
    if (!wallet) return alert("请先连接钱包");
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.pickBottle();
      await tx.wait();
      
      const pickedIds = await contract.getPickedBottles(wallet);
      const lastId = pickedIds[pickedIds.length - 1];
      const b = await contract.bottles(lastId);
      setCurrentBottle({ id: b.id.toString(), content: b.contentHash, creator: b.creator });
    } catch (e) { alert("寻觅失败..."); }
    setLoading(false);
  };

  const submitReply = async () => {
    const input = document.getElementById("replyInput");
    if (!input.value || !currentBottle) return;
    try {
      const contract = await getContract();
      const tx = await contract.replyBottle(currentBottle.id, input.value);
      await tx.wait();
      alert("回信已寄出！");
      setCurrentBottle(null);
    } catch (e) { alert("回复失败"); }
  };

  const tip = async (bottleId, author) => {
    try {
      const contract = await getContract();
      const tx = await contract.tip(bottleId, author, { value: ethers.parseEther("0.01") });
      await tx.wait();
      alert("打赏成功！");
    } catch (e) { alert("打赏失败"); }
  };

  const loadMailboxData = async () => {
    if (!wallet) return;
    try {
      const contract = await getContract();
      const sentIds = await contract.getUserBottles(wallet);
      const sentData = await Promise.all(sentIds.map(async (id) => {
        const b = await contract.bottles(id);
        const rs = await contract.getAllReplies(id);
        return { id: id.toString(), content: b.contentHash, replies: rs };
      }));
      setMySentBottles(sentData);

      const pickedIds = await contract.getPickedBottles(wallet);
      const pickedData = await Promise.all(pickedIds.map(async (id) => {
        const b = await contract.bottles(id);
        return { id: id.toString(), content: b.contentHash, creator: b.creator };
      }));
      setMyPickedBottles(pickedData);
    } catch (e) { console.error(e); }
  };

  const loadWarmWords = async () => {
    try {
      const contract = await getContract();
      const total = await contract.bottleCount();
      const warm = [];
      for (let i = 1; i <= Number(total); i++) {
        const b = await contract.bottles(i);
        if (b.tipAmount > 0n) warm.push(b);
      }
      setWarmWords(warm);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (wallet) {
      if (activeTab === "mail") loadMailboxData();
      if (activeTab === "warm") loadWarmWords();
    }
  }, [activeTab, wallet]);

  return (
    <div className="ocean-container">
      <div className="wave"></div>
      <div className="wave"></div>

      <div className="main-content">
        {/* 顶部状态 */}
        <div style={{ textAlign: "right", marginBottom: "20px" }}>
          {!wallet ? (
            <button onClick={connectWallet}>⚓ 连接钱包</button>
          ) : (
            <span style={{color: "white", fontSize: "0.8rem", background: "rgba(0,0,0,0.3)", padding: "6px 15px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.2)"}}>
              ● {wallet.substring(0, 6)}...{wallet.slice(-4)}
            </span>
          )}
        </div>

        <h1 style={{ textAlign: "center", color: "white", textShadow: "0 4px 15px rgba(0,0,0,0.4)", marginBottom: "30px" }}>🌊 链上漂流瓶</h1>

        {activeTab === "bottle" && (
          <div>
            <div className="glass-card">
              <h3 style={{marginTop: 0, marginBottom: "15px"}}>✍️ 投递信件</h3>
              <textarea id="msgInput" placeholder="写下你的故事，扔进大海..." rows="4" />
              <button onClick={sendBottle} style={{ width: "100%", marginTop: "15px" }}>扔进大海</button>
            </div>

            <div style={{ textAlign: "center", margin: "40px 0" }}>
              <DriftingBottleIcon />
              <div style={{marginTop: "25px"}}>
                <button onClick={pickRandomBottle} disabled={loading} style={{ padding: "18px 50px", fontSize: "1.2rem", borderRadius: "40px" }}>
                  {loading ? "寻觅中..." : "捞一个瓶子"}
                </button>
              </div>
            </div>

            {currentBottle && (
              <div className="glass-card" style={{ border: "2px solid rgba(0, 242, 254, 0.5)", animation: "swell 3s ease-in-out infinite" }}>
                <p style={{color: "#00f2fe", fontWeight: "bold", marginBottom: "10px"}}>拾起缘分：</p>
                <p style={{fontSize: "1.1rem", lineHeight: "1.6", marginBottom: "20px"}}>“{currentBottle.content}”</p>
                <input id="replyInput" placeholder="写个温柔的回信..." />
                <button onClick={submitReply} style={{ width: "100%", marginTop: "12px" }}>发送回信</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "mail" && (
          <div>
            <h3 style={{color: "white", marginBottom: "20px"}}>📬 记忆信箱</h3>
            <div className="glass-card">
              <h4 style={{color: "#00f2fe", marginBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px"}}>我捡到的瓶子</h4>
              {myPickedBottles.length === 0 ? <p style={{opacity: 0.6}}>暂无记录</p> : 
                myPickedBottles.map((b, i) => (
                  <div key={i} style={{marginBottom: "15px", background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: "12px"}}>
                    <p>“{b.content}”</p>
                    <small style={{opacity: 0.5}}>来自: {b.creator.substring(0,8)}...</small>
                  </div>
                ))
              }
            </div>

            <div className="glass-card">
              <h4 style={{color: "#00f2fe", marginBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px"}}>收到的回信</h4>
              {mySentBottles.map((b, i) => (
                <div key={i} style={{marginBottom: "20px"}}>
                  <small style={{opacity: 0.6}}>发出: "{b.content}"</small>
                  {b.replies.map((r, j) => (
                    <div key={j} className="glass-card" style={{background: "rgba(255,255,255,0.05)", padding: "10px", marginTop: "8px", display: "flex", justifyContent: "space-between"}}>
                      <span>{r.contentHash}</span>
                      <button style={{padding: "4px 10px", fontSize: "0.8rem"}} onClick={() => tip(b.id, r.replier)}>💰赏</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "warm" && (
          <div>
            <h3 style={{color: "white", textAlign: "center", marginBottom: "25px"}}>✨ 暖言集</h3>
            {warmWords.map((w, i) => (
              <div key={i} className="glass-card" style={{textAlign: "center", border: "1px solid rgba(255, 215, 0, 0.4)"}}>
                <p style={{fontSize: "1.2rem", fontStyle: "italic"}}>“{w.contentHash}”</p>
                <div style={{color: "#FFD700", marginTop: "10px", fontSize: "0.9rem"}}>
                  打赏: {ethers.formatEther(w.tipAmount)} AVAX
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <div className={`nav-item ${activeTab === "bottle" ? "active" : ""}`} onClick={() => setActiveTab("bottle")}>
          <span className="nav-icon">💧</span>
          <span style={{fontSize: "0.7rem"}}>大海</span>
        </div>
        <div className={`nav-item ${activeTab === "mail" ? "active" : ""}`} onClick={() => setActiveTab("mail")}>
          <span className="nav-icon">📮</span>
          <span style={{fontSize: "0.7rem"}}>信箱</span>
        </div>
        <div className={`nav-item ${activeTab === "warm" ? "active" : ""}`} onClick={() => setActiveTab("warm")}>
          <span className="nav-icon">🌟</span>
          <span style={{fontSize: "0.7rem"}}>暖言</span>
        </div>
      </div>
    </div>
  );
}

export default App;