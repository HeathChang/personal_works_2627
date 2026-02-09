# Socket.IO 기본 101

## 목차
1. [Socket.IO란?](#socketio란)
2. [왜 Socket.IO를 사용하는가?](#왜-socketio를-사용하는가)
3. [기본 개념 이해하기](#기본-개념-이해하기)
4. [설치 및 설정](#설치-및-설정)
5. [서버 설정](#서버-설정)
6. [클라이언트 설정](#클라이언트-설정)
7. [기본 이벤트와 메서드](#기본-이벤트와-메서드)
8. [실전 예제](#실전-예제)
9. [고급 개념](#고급-개념)
10. [자주 묻는 질문](#자주-묻는-질문)

---

## Socket.IO란?

**Socket.IO**는 실시간 양방향 이벤트 기반 통신을 위한 JavaScript 라이브러리입니다. 

### 핵심 특징
- **양방향 통신**: 클라이언트와 서버가 서로 메시지를 주고받을 수 있음
- **실시간**: 지연 없이 즉시 데이터 전송
- **이벤트 기반**: 특정 이벤트가 발생하면 자동으로 반응
- **자동 폴백**: WebSocket이 지원되지 않으면 자동으로 다른 방식(폴링)으로 전환

### 전통적인 HTTP vs Socket.IO

#### 전통적인 HTTP 통신
```
클라이언트 → 요청 → 서버
클라이언트 ← 응답 ← 서버
(요청-응답 패턴, 연결 종료)
```

#### Socket.IO 통신
```
클라이언트 ←→ 서버 (지속적인 연결)
클라이언트 ←→ 서버 (양방향 실시간 통신)
```

---

## 왜 Socket.IO를 사용하는가?

### 사용 사례
1. **채팅 애플리케이션**: 실시간 메시지 전송
2. **협업 도구**: 여러 사용자가 동시에 문서 편집
3. **게임**: 실시간 멀티플레이어 게임
4. **주식 시세**: 실시간 가격 업데이트
5. **알림 시스템**: 실시간 알림 전송
6. **라이브 대시보드**: 실시간 데이터 모니터링

### 장점
- ✅ 실시간 통신이 간단함
- ✅ 자동 재연결 기능
- ✅ 방(Room) 개념으로 그룹 통신 가능
- ✅ 브로드캐스팅 지원
- ✅ 다양한 전송 방식 자동 지원

---

## 기본 개념 이해하기

### 1. Socket (소켓)
**Socket**은 클라이언트와 서버 간의 개별 연결을 나타냅니다. 각 클라이언트는 고유한 Socket 객체를 가집니다.

```
클라이언트 A ──Socket A──→ 서버
클라이언트 B ──Socket B──→ 서버
클라이언트 C ──Socket C──→ 서버
```

### 2. Event (이벤트)
**Event**는 통신의 기본 단위입니다. 특정 이름의 이벤트를 발생시키고(listen) 수신할 수 있습니다.

```javascript
// 이벤트 발생 (emit)
socket.emit('message', 'Hello!');

// 이벤트 수신 (on)
socket.on('message', (data) => {
  console.log(data); // 'Hello!'
});
```

### 3. Namespace (네임스페이스)
**Namespace**는 Socket.IO 연결의 논리적 분리입니다. 기본적으로 `/` 네임스페이스가 사용됩니다.

```
/ (기본 네임스페이스)
/admin (관리자 네임스페이스)
/chat (채팅 네임스페이스)
```

### 4. Room (방)
**Room**은 Socket을 그룹화하는 메커니즘입니다. 같은 Room에 있는 Socket들끼리만 메시지를 주고받을 수 있습니다.

```
Room: "lobby"
  ├── Socket A
  ├── Socket B
  └── Socket C

Room: "game-123"
  ├── Socket D
  └── Socket E
```

---

## 설치 및 설정

### 서버 설치 (Node.js)

```bash
npm install socket.io
```

### 클라이언트 설치

#### 브라우저 (CDN)
```html
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
```

#### npm (프로젝트)
```bash
npm install socket.io-client
```

---

## 서버 설정

### 기본 서버 설정

```javascript
// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // 클라이언트 주소
    methods: ["GET", "POST"]
  }
});

// 클라이언트 연결 시
io.on('connection', (socket) => {
  console.log('사용자 연결됨:', socket.id);

  // 연결 해제 시
  socket.on('disconnect', () => {
    console.log('사용자 연결 해제됨:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('Socket.IO 서버 실행 중: http://localhost:3001');
});
```

### 서버 주요 메서드

#### 1. `io.on('connection', callback)`
새로운 클라이언트가 연결될 때 실행됩니다.

```javascript
io.on('connection', (socket) => {
  // socket: 연결된 클라이언트의 Socket 객체
});
```

#### 2. `socket.on(eventName, callback)`
클라이언트로부터 이벤트를 수신합니다.

```javascript
socket.on('message', (data) => {
  console.log('받은 메시지:', data);
});
```

#### 3. `socket.emit(eventName, data)`
특정 클라이언트에게 이벤트를 전송합니다.

```javascript
socket.emit('message', '안녕하세요!');
```

#### 4. `io.emit(eventName, data)`
연결된 모든 클라이언트에게 이벤트를 전송합니다 (브로드캐스트).

```javascript
io.emit('announcement', '모든 사용자에게 알림');
```

#### 5. `socket.broadcast.emit(eventName, data)`
현재 클라이언트를 제외한 모든 클라이언트에게 전송합니다.

```javascript
socket.broadcast.emit('user-joined', '새 사용자가 입장했습니다');
```

---

## 클라이언트 설정

### 브라우저 클라이언트

```javascript
// 클라이언트 연결
const socket = io('http://localhost:3001');

// 연결 성공
socket.on('connect', () => {
  console.log('서버에 연결됨:', socket.id);
});

// 연결 해제
socket.on('disconnect', () => {
  console.log('서버 연결 해제됨');
});

// 서버로 이벤트 전송
socket.emit('message', 'Hello Server!');

// 서버로부터 이벤트 수신
socket.on('message', (data) => {
  console.log('서버로부터 받은 메시지:', data);
});
```

### React 클라이언트 예제

```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Socket 연결
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // 메시지 수신
    newSocket.on('message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    // 정리 함수
    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket) {
      socket.emit('message', 'Hello from React!');
    }
  };

  return (
    <div>
      <button onClick={sendMessage}>메시지 전송</button>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 기본 이벤트와 메서드

### 내장 이벤트

#### 서버 측
- `connection`: 클라이언트 연결 시
- `disconnect`: 클라이언트 연결 해제 시

#### 클라이언트 측
- `connect`: 서버 연결 성공 시
- `disconnect`: 서버 연결 해제 시
- `connect_error`: 연결 오류 시
- `reconnect`: 재연결 성공 시

### 커스텀 이벤트

원하는 이름으로 이벤트를 만들 수 있습니다.

```javascript
// 서버
socket.on('user-login', (userData) => {
  console.log('사용자 로그인:', userData);
});

// 클라이언트
socket.emit('user-login', { username: 'john', id: 123 });
```

### 주요 메서드

#### `emit(eventName, data, callback)`
이벤트를 전송합니다. 선택적으로 콜백을 받을 수 있습니다.

```javascript
// 단방향 전송
socket.emit('message', 'Hello');

// 콜백을 받는 전송
socket.emit('getUser', { id: 1 }, (response) => {
  console.log('응답:', response);
});
```

#### `on(eventName, callback)`
이벤트를 수신합니다.

```javascript
socket.on('message', (data) => {
  console.log(data);
});
```

#### `once(eventName, callback)`
이벤트를 한 번만 수신합니다.

```javascript
socket.once('welcome', (data) => {
  console.log('환영 메시지:', data);
});
```

#### `off(eventName, callback)`
이벤트 리스너를 제거합니다.

```javascript
const handler = (data) => console.log(data);
socket.on('message', handler);
socket.off('message', handler);
```

---

## 실전 예제

### 예제 1: 간단한 채팅 애플리케이션

#### 서버 (server.js)
```javascript
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log('사용자 연결:', socket.id);

  // 메시지 수신 및 브로드캐스트
  socket.on('chat-message', (data) => {
    // 모든 클라이언트에게 메시지 전송
    io.emit('chat-message', {
      id: socket.id,
      message: data.message,
      username: data.username,
      timestamp: new Date()
    });
  });

  // 사용자 입장 알림
  socket.on('user-joined', (username) => {
    socket.broadcast.emit('user-joined', username);
  });

  // 연결 해제
  socket.on('disconnect', () => {
    console.log('사용자 연결 해제:', socket.id);
    socket.broadcast.emit('user-left', socket.id);
  });
});

server.listen(3001, () => {
  console.log('채팅 서버 실행 중: http://localhost:3001');
});
```

#### 클라이언트 (client.html)
```html
<!DOCTYPE html>
<html>
<head>
  <title>Socket.IO 채팅</title>
</head>
<body>
  <div id="messages"></div>
  <input type="text" id="username" placeholder="사용자명">
  <input type="text" id="messageInput" placeholder="메시지 입력">
  <button onclick="sendMessage()">전송</button>

  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
  <script>
    const socket = io('http://localhost:3001');
    const messagesDiv = document.getElementById('messages');
    const messageInput = document.getElementById('messageInput');
    const usernameInput = document.getElementById('username');

    // 연결 성공
    socket.on('connect', () => {
      addMessage('시스템', '서버에 연결되었습니다.');
    });

    // 메시지 수신
    socket.on('chat-message', (data) => {
      addMessage(data.username, data.message);
    });

    // 사용자 입장
    socket.on('user-joined', (username) => {
      addMessage('시스템', `${username}님이 입장했습니다.`);
    });

    // 메시지 전송
    function sendMessage() {
      const username = usernameInput.value || '익명';
      const message = messageInput.value;
      
      if (message) {
        socket.emit('chat-message', { username, message });
        messageInput.value = '';
      }
    }

    // 메시지 표시
    function addMessage(username, message) {
      const div = document.createElement('div');
      div.textContent = `[${username}]: ${message}`;
      messagesDiv.appendChild(div);
    }

    // Enter 키로 전송
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  </script>
</body>
</html>
```

### 예제 2: Room을 사용한 그룹 채팅

#### 서버
```javascript
io.on('connection', (socket) => {
  // Room 입장
  socket.on('join-room', (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit('user-joined-room', socket.id);
    console.log(`${socket.id}가 ${roomName}에 입장했습니다.`);
  });

  // Room에서 메시지 전송
  socket.on('room-message', (data) => {
    // 특정 Room의 모든 클라이언트에게만 전송
    io.to(data.room).emit('room-message', {
      id: socket.id,
      message: data.message,
      room: data.room
    });
  });

  // Room 퇴장
  socket.on('leave-room', (roomName) => {
    socket.leave(roomName);
    socket.to(roomName).emit('user-left-room', socket.id);
  });
});
```

#### 클라이언트
```javascript
const socket = io('http://localhost:3001');

// Room 입장
socket.emit('join-room', 'lobby');

// Room 메시지 전송
socket.emit('room-message', {
  room: 'lobby',
  message: '안녕하세요!'
});

// Room 메시지 수신
socket.on('room-message', (data) => {
  console.log(`[${data.room}] ${data.message}`);
});
```

### 예제 3: 실시간 사용자 수 표시

#### 서버
```javascript
let userCount = 0;

io.on('connection', (socket) => {
  userCount++;
  // 모든 클라이언트에게 사용자 수 업데이트
  io.emit('user-count', userCount);

  socket.on('disconnect', () => {
    userCount--;
    io.emit('user-count', userCount);
  });
});
```

#### 클라이언트
```javascript
socket.on('user-count', (count) => {
  document.getElementById('userCount').textContent = 
    `현재 접속자: ${count}명`;
});
```

---

## 고급 개념

### 1. 미들웨어 (Middleware)

미들웨어를 사용하여 연결 시 인증이나 검증을 수행할 수 있습니다.

```javascript
// 서버
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (token === 'valid-token') {
    next(); // 연결 허용
  } else {
    next(new Error('인증 실패')); // 연결 거부
  }
});

io.on('connection', (socket) => {
  console.log('인증된 사용자 연결:', socket.id);
});
```

```javascript
// 클라이언트
const socket = io('http://localhost:3001', {
  auth: {
    token: 'valid-token'
  }
});
```

### 2. 네임스페이스 (Namespace)

서로 다른 기능을 논리적으로 분리할 수 있습니다.

```javascript
// 서버
const adminNamespace = io.of('/admin');

adminNamespace.on('connection', (socket) => {
  console.log('관리자 연결:', socket.id);
  socket.emit('admin-welcome', '관리자 페이지에 오신 것을 환영합니다.');
});
```

```javascript
// 클라이언트
const adminSocket = io('http://localhost:3001/admin');
adminSocket.on('admin-welcome', (message) => {
  console.log(message);
});
```

### 3. Socket 인스턴스 속성

```javascript
socket.id          // 고유 ID
socket.rooms       // 현재 속한 Room 목록
socket.handshake   // 연결 시 전달된 정보
socket.data        // Socket에 저장할 커스텀 데이터
```

### 4. 에러 처리

```javascript
// 클라이언트
socket.on('connect_error', (error) => {
  console.error('연결 오류:', error.message);
});

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // 서버가 연결을 끊음 (수동 재연결 필요)
    socket.connect();
  }
  // 그 외의 경우 자동 재연결
});
```

### 5. 이벤트 확인 (Acknowledgment)

서버에서 응답을 받을 수 있습니다.

```javascript
// 서버
socket.on('get-data', (data, callback) => {
  const result = { status: 'success', data: 'some data' };
  callback(result); // 클라이언트로 응답 전송
});
```

```javascript
// 클라이언트
socket.emit('get-data', { id: 1 }, (response) => {
  console.log('서버 응답:', response);
});
```

---

## 자주 묻는 질문

### Q1: Socket.IO와 WebSocket의 차이는?

**WebSocket**은 브라우저 네이티브 API이고, **Socket.IO**는 WebSocket을 포함한 여러 전송 방식을 자동으로 선택하는 라이브러리입니다.

- Socket.IO는 WebSocket이 지원되지 않으면 자동으로 폴링으로 전환
- Socket.IO는 Room, Namespace 등 추가 기능 제공
- Socket.IO는 자동 재연결 기능 내장

### Q2: 여러 클라이언트에게 동시에 메시지를 보내는 방법은?

```javascript
// 모든 클라이언트에게
io.emit('event', data);

// 특정 Room의 클라이언트에게
io.to('room-name').emit('event', data);

// 현재 클라이언트 제외한 모든 클라이언트에게
socket.broadcast.emit('event', data);

// 특정 Room의 다른 클라이언트에게 (현재 클라이언트 제외)
socket.to('room-name').emit('event', data);
```

### Q3: Socket 연결을 안전하게 종료하는 방법은?

```javascript
// 클라이언트
socket.disconnect(); // 연결 종료

// 서버
socket.disconnect(); // 특정 클라이언트 연결 종료
```

### Q4: Room에 있는 모든 Socket 목록을 얻는 방법은?

```javascript
const room = io.sockets.adapter.rooms.get('room-name');
if (room) {
  const socketIds = Array.from(room);
  console.log('Room의 Socket ID들:', socketIds);
}
```

### Q5: Socket.IO를 Next.js에서 사용하는 방법은?

```javascript
// pages/api/socket.js (API Route)
import { Server } from 'socket.io';

export default function handler(req, res) {
  if (res.socket.server.io) {
    console.log('Socket already running');
  } else {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('클라이언트 연결:', socket.id);
    });
  }
  res.end();
}
```

```javascript
// 클라이언트 컴포넌트
'use client';
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export default function Chat() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // ... 나머지 코드
}
```

### Q6: CORS 오류가 발생하는 경우?

서버에서 CORS 설정을 확인하세요.

```javascript
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // 클라이언트 주소
    methods: ["GET", "POST"],
    credentials: true
  }
});
```

---

## 요약

### 핵심 개념
1. **Socket**: 클라이언트-서버 간의 개별 연결
2. **Event**: 통신의 기본 단위 (emit으로 전송, on으로 수신)
3. **Room**: Socket을 그룹화하여 그룹 통신
4. **Namespace**: 논리적 연결 분리

### 기본 패턴
```javascript
// 서버
io.on('connection', (socket) => {
  socket.on('event', (data) => {
    // 처리 로직
    socket.emit('response', result);
  });
});

// 클라이언트
socket.on('connect', () => {
  socket.emit('event', data);
  socket.on('response', (result) => {
    // 처리 로직
  });
});
```

### 다음 단계
- [ ] Socket.IO 공식 문서: https://socket.io/docs/v4/
- [ ] 인증 및 보안 구현
- [ ] 성능 최적화
- [ ] 클러스터링 (여러 서버 간 Socket.IO 사용)

---

**작성일**: 2024년
**버전**: Socket.IO v4.x 기준
