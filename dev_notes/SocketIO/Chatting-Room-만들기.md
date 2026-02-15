# Socket.IO Chatting Room 만들기 가이드

## 목차
1. [Room이란 무엇인가?](#room이란-무엇인가)
2. [Room 클래스 구조 이해하기](#room-클래스-구조-이해하기)
3. [서버 측: Room 생성하기](#서버-측-room-생성하기)
4. [Namespace에 Room 추가하기](#namespace에-room-추가하기)
5. [클라이언트 측: Room 조인하기](#클라이언트-측-room-조인하기)
6. [Room 메시지 히스토리 관리](#room-메시지-히스토리-관리)
7. [전체 흐름 다이어그램](#전체-흐름-다이어그램)
8. [실전 예제 코드](#실전-예제-코드)
9. [주의사항 및 보안 고려사항](#주의사항-및-보안-고려사항)
10. [자주 묻는 질문](#자주-묻는-질문)

---

## Room이란 무엇인가?

### 기본 개념

**Room(방)**은 Socket.IO에서 여러 클라이언트를 그룹화하는 메커니즘입니다. 같은 Room에 속한 클라이언트들끼리만 메시지를 주고받을 수 있습니다.

### 실생활 비유

채팅 애플리케이션을 예로 들면:
- **Namespace** = 건물 (예: "회사 건물", "학교 건물")
- **Room** = 건물 안의 개별 방 (예: "회의실 A", "회의실 B", "휴게실")

```
Namespace: /wiki (위키피디아)
├── Room: "New Articles" (새로운 글)
├── Room: "Editors" (편집자들)
└── Room: "Other" (기타)

Namespace: /mozilla (모질라)
├── Room: "Firefox"
├── Room: "SeaMonkey"
└── Room: "SpiderMonkey"
```

### Room의 특징

1. **격리된 통신**: Room A의 메시지는 Room B의 사용자에게 전달되지 않음
2. **동적 참여**: 사용자는 언제든지 Room에 들어가거나 나갈 수 있음
3. **히스토리 저장**: Room별로 메시지 히스토리를 저장할 수 있음
4. **사용자 수 추적**: Room에 몇 명이 있는지 실시간으로 확인 가능

---

## Room 클래스 구조 이해하기

### Room 클래스 코드 분석

```1:19:SocketIO/Robert/01-socketio201/slackClone/classes/Room.js
class Room{
    constructor(roomId,roomTitle,namespaceId,privateRoom = false){
        this.roomId = roomId;
        this.roomTitle = roomTitle;
        this.namespaceId = namespaceId;
        this.privateRoom = privateRoom;
        this.history = [];
    }

    addMessage(message){
        this.history.push(message);
    }

    clearHistory(){
        this.history = [];
    }
}

module.exports = Room;
```

### 각 속성 설명

#### 1. `roomId` (방 ID)
- **타입**: Number
- **설명**: Room을 식별하는 고유 번호
- **예시**: `0`, `1`, `2`
- **용도**: 데이터베이스나 배열에서 Room을 찾을 때 사용

#### 2. `roomTitle` (방 제목)
- **타입**: String
- **설명**: Room의 이름 (사용자에게 보이는 이름)
- **예시**: `"New Articles"`, `"Firefox"`, `"Editors"`
- **중요**: Socket.IO의 `socket.join()` 메서드에서 실제 Room 식별자로 사용됨

#### 3. `namespaceId` (네임스페이스 ID)
- **타입**: Number
- **설명**: 이 Room이 속한 Namespace의 ID
- **예시**: `0` (wiki Namespace), `1` (mozilla Namespace)
- **용도**: 어떤 Namespace에 속한 Room인지 추적

#### 4. `privateRoom` (비공개 방 여부)
- **타입**: Boolean
- **기본값**: `false` (공개 방)
- **설명**: 비공개 방인지 여부를 나타냄
- **용도**: UI에서 자물쇠 아이콘 표시 등에 사용

#### 5. `history` (메시지 히스토리)
- **타입**: Array
- **설명**: 이 Room에서 주고받은 메시지들의 배열
- **초기값**: 빈 배열 `[]`
- **용도**: 새로 Room에 입장한 사용자에게 이전 메시지들을 보여줄 때 사용

### 메서드 설명

#### `addMessage(message)`
- **기능**: Room의 히스토리에 메시지 추가
- **매개변수**: `message` (Object) - 메시지 객체
- **사용 예시**:
```javascript
const room = new Room(0, "New Articles", 0);
room.addMessage({
    text: "Hello World!",
    username: "John",
    time: new Date()
});
```

#### `clearHistory()`
- **기능**: Room의 모든 메시지 히스토리 삭제
- **사용 예시**:
```javascript
room.clearHistory(); // history = []
```

---

## 서버 측: Room 생성하기

### 1단계: Room 클래스 import

서버 파일(`slack.js`)에서 Room 클래스를 가져옵니다:

```javascript
const Room = require('./classes/Room');
```

### 2단계: Room 인스턴스 생성

`new` 키워드를 사용하여 Room 객체를 생성합니다:

```javascript
// 기본 문법
const room = new Room(roomId, roomTitle, namespaceId, privateRoom);

// 예시 1: 공개 방 생성
const publicRoom = new Room(0, "New Articles", 0, false);
// 또는 privateRoom을 생략하면 자동으로 false
const publicRoom2 = new Room(0, "New Articles", 0);

// 예시 2: 비공개 방 생성
const privateRoom = new Room(1, "Editors", 0, true);
```

### 매개변수 상세 설명

1. **`roomId`**: Room의 고유 번호 (같은 Namespace 내에서 고유해야 함)
2. **`roomTitle`**: Room의 이름 (사용자에게 표시될 이름)
3. **`namespaceId`**: 속한 Namespace의 ID
4. **`privateRoom`**: 비공개 여부 (선택사항, 기본값: `false`)

### 실제 예제: namespaces.js 파일

```1:22:SocketIO/Robert/01-socketio201/slackClone/data/namespaces.js
const Namespace = require('../classes/Namespace');
const Room = require('../classes/Room');

const wikiNs = new Namespace(0,'Wikipedia','https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Wikipedia-logo-v2.svg/103px-Wikipedia-logo-v2.svg.png','/wiki');
const mozNs = new Namespace(1,'Mozilla','https://www.mozilla.org/media/img/logos/firefox/logo-quantum.9c5e96634f92.png','/mozilla')
const linuxNs = new Namespace(2,'Linux','https://upload.wikimedia.org/wikipedia/commons/a/af/Tux.png','/linux')

wikiNs.addRoom(new Room(0,'New Articles',0,true));
wikiNs.addRoom(new Room(1,'Editors',0));
wikiNs.addRoom(new Room(2,'Other',0));

mozNs.addRoom(new Room(0,'Firefox',1));
mozNs.addRoom(new Room(1,'SeaMonkey',1));
mozNs.addRoom(new Room(2,'SpiderMonkey',1));
mozNs.addRoom(new Room(3,'Rust',1));

linuxNs.addRoom(new Room(0,'Debian',2))
linuxNs.addRoom(new Room(1,'Red Hat',2))
linuxNs.addRoom(new Room(2,'Ubuntu',2))
linuxNs.addRoom(new Room(3,'Mac OS',2))

const namespaces = [wikiNs,mozNs,linuxNs];

module.exports = namespaces;
```

### 코드 분석

#### Wikipedia Namespace에 Room 추가하기
```javascript
// 1. 비공개 Room 생성 (privateRoom = true)
wikiNs.addRoom(new Room(0, 'New Articles', 0, true));

// 2. 공개 Room 생성 (privateRoom 생략 = false)
wikiNs.addRoom(new Room(1, 'Editors', 0));

// 3. 또 다른 공개 Room
wikiNs.addRoom(new Room(2, 'Other', 0));
```

**중요 포인트**:
- `roomId`는 같은 Namespace 내에서만 고유하면 됨 (다른 Namespace와는 겹쳐도 됨)
- `namespaceId`는 항상 해당 Namespace의 ID와 일치해야 함
- `roomTitle`은 Socket.IO의 실제 Room 식별자로 사용됨

---

## Namespace에 Room 추가하기

### Namespace 클래스 구조

```1:17:SocketIO/Robert/01-socketio201/slackClone/classes/Namespace.js
class Namespace{

    constructor(id,name,image,endpoint){
        this.id = id;
        this.name = name;
        this.image = image;
        this.endpoint = endpoint;
        this.rooms = [];
    }

    addRoom(roomObj){
        this.rooms.push(roomObj);
    }

}

module.exports = Namespace;
```

### Room 추가 방법

#### 방법 1: 직접 addRoom() 메서드 사용
```javascript
const Namespace = require('./classes/Namespace');
const Room = require('./classes/Room');

// Namespace 생성
const wikiNs = new Namespace(0, 'Wikipedia', 'image.png', '/wiki');

// Room 생성 및 추가
const newRoom = new Room(0, 'New Articles', 0, true);
wikiNs.addRoom(newRoom);
```

#### 방법 2: 한 줄로 작성
```javascript
wikiNs.addRoom(new Room(0, 'New Articles', 0, true));
```

#### 방법 3: 여러 Room 한 번에 추가
```javascript
// Room들을 배열로 생성
const rooms = [
    new Room(0, 'New Articles', 0, true),
    new Room(1, 'Editors', 0),
    new Room(2, 'Other', 0)
];

// 반복문으로 추가
rooms.forEach(room => {
    wikiNs.addRoom(room);
});
```

### 동적으로 Room 추가하기 (런타임)

서버가 실행 중일 때 새로운 Room을 추가할 수 있습니다:

```17:23:SocketIO/Robert/01-socketio201/slackClone/slack.js
//manufactured way to change an ns (without building a huge UI)
app.get('/change-ns',(req, res)=>{
    //update namespaces array
    namespaces[0].addRoom(new Room(0,'Deleted Articles',0))
    //let everyone know in THIS namespace, that it changed
    io.of(namespaces[0].endpoint).emit('nsChange',namespaces[0]);
    res.json(namespaces[0]);
})
```

**동작 과정**:
1. HTTP GET 요청이 `/change-ns`로 들어옴
2. `namespaces[0]` (첫 번째 Namespace)에 새 Room 추가
3. 해당 Namespace에 연결된 모든 클라이언트에게 `nsChange` 이벤트 전송
4. 클라이언트는 새로운 Room 목록을 받아서 UI 업데이트

---

## 클라이언트 측: Room 조인하기

### 전체 흐름

1. **Namespace 선택** → Namespace에 연결
2. **Room 목록 표시** → 서버에서 받은 Room 목록을 UI에 표시
3. **Room 클릭** → `joinRoom()` 함수 호출
4. **서버에 조인 요청** → `joinRoom` 이벤트 emit
5. **서버 처리** → Room에 조인하고 히스토리 반환
6. **UI 업데이트** → 히스토리 표시 및 사용자 수 업데이트

### 1단계: Namespace 선택 및 Room 목록 표시

```1:46:SocketIO/Robert/01-socketio201/slackClone/public/joinNs.js
// We could ask the server for fresh info on this NS. BAD!!
// We have socket.io/ws, and the server will tell us when something has happened!

const joinNs = (element,nsData)=>{
    const nsEndpoint = element.getAttribute('ns');
    console.log(nsEndpoint);

    const clickedNs = nsData.find(row=>row.endpoint === nsEndpoint);
    //global so we can submit the new message to the right place
    selectedNsId = clickedNs.id;
    const rooms = clickedNs.rooms;

    //get the room-list div
    let roomList = document.querySelector('.room-list');
    //clear it out
    roomList.innerHTML = "";

    //init firstRoom var
    let firstRoom;

    //loop through each room, and add it to the DOM
    rooms.forEach((room,i)=>{
        if(i === 0){
            firstRoom = room.roomTitle;
        }
        console.log(room);
        roomList.innerHTML += `<li class="room" namespaceId=${room.namespaceId}>
            <span class="fa-solid fa-${room.privateRoom ? 'lock' : 'globe'}"></span>${room.roomTitle}
        </li>`
    })

    //init join first room
    joinRoom(firstRoom,clickedNs.id)

    //add click listener to each room so the client can tell the server it wants to join!
    const roomNodes = document.querySelectorAll('.room');
    Array.from(roomNodes).forEach(elem=>{
        elem.addEventListener('click',e=>{
            // console.log("Someone clicked on "+e.target.innerText);
            const namespaceId = elem.getAttribute('namespaceId')
            joinRoom(e.target.innerText,namespaceId)
        })
    })

    localStorage.setItem('lastNs',nsEndpoint);
}
```

**코드 설명**:
1. **Namespace 데이터 찾기**: `nsData.find()`로 클릭한 Namespace 찾기
2. **Room 목록 가져오기**: `clickedNs.rooms`에서 Room 배열 가져오기
3. **UI 업데이트**: 각 Room을 `<li>` 태그로 DOM에 추가
   - 비공개 Room: 자물쇠 아이콘 (`fa-lock`)
   - 공개 Room: 지구본 아이콘 (`fa-globe`)
4. **첫 번째 Room 자동 조인**: `joinRoom(firstRoom, clickedNs.id)` 호출
5. **클릭 이벤트 리스너**: 각 Room 클릭 시 `joinRoom()` 함수 호출

### 2단계: Room 조인 함수

```1:26:SocketIO/Robert/01-socketio201/slackClone/public/joinRoom.js
const joinRoom = async(roomTitle,namespaceId)=>{

    console.log(roomTitle,namespaceId);
    const ackResp = await nameSpaceSockets[namespaceId].emitWithAck('joinRoom',{roomTitle,namespaceId});
    console.log(ackResp);
    document.querySelector('.curr-room-num-users').innerHTML = `${ackResp.numUsers}<span class="fa-solid fa-user"></span>`
    document.querySelector('.curr-room-text').innerHTML = roomTitle;

    //we get back the room history in the acknowledge as well!
    document.querySelector('#messages').innerHTML = "";

    ackResp.thisRoomsHistory.forEach(message=>{
        document.querySelector('#messages').innerHTML += buildMessageHtml(message)
    })


    // nameSpaceSockets[namespaceId].emit('joinRoom',roomTitle,(ackCallBack)=>{
    //     console.log(ackCallBack);

    //     document.querySelector('.curr-room-num-users').innerHTML = `${ackCallBack.numUsers}<span class="fa-solid fa-user"></span>`
    //     document.querySelector('.curr-room-text').innerHTML = roomTitle;

    // });


}
```

**코드 설명**:

1. **비동기 함수**: `async` 키워드로 비동기 함수 선언
2. **서버에 조인 요청**: 
   ```javascript
   await nameSpaceSockets[namespaceId].emitWithAck('joinRoom', {roomTitle, namespaceId})
   ```
   - `emitWithAck`: 서버로 이벤트를 보내고 응답을 기다림 (Acknowledgment)
   - `'joinRoom'`: 이벤트 이름
   - `{roomTitle, namespaceId}`: 전송할 데이터
3. **응답 처리**: 서버로부터 받은 응답(`ackResp`) 처리
   - `numUsers`: Room에 있는 사용자 수
   - `thisRoomsHistory`: Room의 메시지 히스토리
4. **UI 업데이트**:
   - 현재 Room 제목 표시
   - 사용자 수 표시
   - 메시지 히스토리 표시

### 3단계: 서버에서 Room 조인 처리

```55:87:SocketIO/Robert/01-socketio201/slackClone/slack.js
        socket.on('joinRoom',async(roomObj,ackCallBack)=>{
            //need to fetch the history
            const thisNs = namespaces[roomObj.namespaceId];
            const thisRoomObj = thisNs.rooms.find(room=>room.roomTitle === roomObj.roomTitle)
            const thisRoomsHistory = thisRoomObj.history;

            //leave all rooms, because the client can only be in one room
            const rooms = socket.rooms;
            // console.log(rooms);
            let i = 0;
            rooms.forEach(room=>{
                //we don't want to leave the socket's personal room which is guaranteed to be first
                if(i!==0){
                    socket.leave(room);
                }
                i++;
            })

            //join the room! 
            // NOTE - roomTitle is coming from the client. Which is NOT safe.
            // Auth to make sure the socket has right to be in that room
            socket.join(roomObj.roomTitle);

            //fetch the number of sockets in this room
            const sockets = await io.of(namespace.endpoint).in(roomObj.roomTitle).fetchSockets()
            // console.log(sockets);
            const socketCount = sockets.length;

            ackCallBack({
                numUsers: socketCount,
                thisRoomsHistory,
            })
        })
```

**서버 코드 상세 분석**:

#### 1. Room 객체 찾기
```javascript
const thisNs = namespaces[roomObj.namespaceId];
const thisRoomObj = thisNs.rooms.find(room => room.roomTitle === roomObj.roomTitle);
const thisRoomsHistory = thisRoomObj.history;
```
- Namespace 찾기: `namespaces` 배열에서 해당 ID의 Namespace 찾기
- Room 찾기: Namespace의 `rooms` 배열에서 `roomTitle`이 일치하는 Room 찾기
- 히스토리 가져오기: 찾은 Room의 `history` 배열 가져오기

#### 2. 기존 Room에서 나가기
```javascript
const rooms = socket.rooms;
let i = 0;
rooms.forEach(room => {
    if(i !== 0) {
        socket.leave(room);
    }
    i++;
})
```
**중요**: 
- `socket.rooms`는 Set 자료구조 (배열이 아님!)
- 첫 번째 Room은 Socket의 개인 Room (항상 존재, `socket.id`와 같음)
- 나머지 Room들에서 모두 나가기 (한 번에 하나의 Room만 참여 가능)

#### 3. 새 Room에 조인
```javascript
socket.join(roomObj.roomTitle);
```
- `roomTitle`을 Room 식별자로 사용하여 조인
- 이제 이 Socket은 해당 Room의 메시지를 받을 수 있음

#### 4. Room의 사용자 수 계산
```javascript
const sockets = await io.of(namespace.endpoint).in(roomObj.roomTitle).fetchSockets();
const socketCount = sockets.length;
```
- `io.of(namespace.endpoint)`: 특정 Namespace의 Socket.IO 인스턴스
- `.in(roomObj.roomTitle)`: 특정 Room에 있는 Socket들만 필터링
- `.fetchSockets()`: 해당 Room의 모든 Socket 객체 배열 반환
- `sockets.length`: Room에 있는 사용자 수

#### 5. 클라이언트에 응답 전송
```javascript
ackCallBack({
    numUsers: socketCount,
    thisRoomsHistory,
})
```
- `ackCallBack`: 클라이언트의 `emitWithAck`에 대한 응답 함수
- 사용자 수와 메시지 히스토리를 클라이언트에 전송

---

## Room 메시지 히스토리 관리

### 메시지 저장하기

새로운 메시지가 Room에 전송될 때 히스토리에 저장합니다:

```89:102:SocketIO/Robert/01-socketio201/slackClone/slack.js
        socket.on('newMessageToRoom',messageObj=>{
            console.log(messageObj);
            //broadcast this to all the connected clients... this room only!
            //how can we find out what room THIS socket is in?
            const rooms = socket.rooms;
            const currentRoom = [...rooms][1]; //this is a set!! Not array
            //send out this messageObj to everyone including the sender
            io.of(namespace.endpoint).in(currentRoom).emit('messageToRoom',messageObj)
            //add this message to this room's history
            const thisNs = namespaces[messageObj.selectedNsId];
            const thisRoom = thisNs.rooms.find(room=>room.roomTitle === currentRoom);
            console.log(thisRoom)
            thisRoom.addMessage(messageObj);
        })
```

**코드 분석**:

1. **현재 Room 찾기**:
   ```javascript
   const rooms = socket.rooms;  // Set 자료구조
   const currentRoom = [...rooms][1];  // Set을 배열로 변환 후 두 번째 요소 (첫 번째는 개인 Room)
   ```
   - `socket.rooms`는 Set이므로 배열로 변환 필요
   - `[0]`: Socket의 개인 Room (항상 존재)
   - `[1]`: 실제 참여한 Room

2. **Room의 모든 사용자에게 메시지 전송**:
   ```javascript
   io.of(namespace.endpoint).in(currentRoom).emit('messageToRoom', messageObj);
   ```
   - `.in(currentRoom)`: 특정 Room에만 메시지 전송
   - 모든 참여자(발신자 포함)에게 메시지 전송

3. **히스토리에 메시지 추가**:
   ```javascript
   const thisNs = namespaces[messageObj.selectedNsId];
   const thisRoom = thisNs.rooms.find(room => room.roomTitle === currentRoom);
   thisRoom.addMessage(messageObj);
   ```
   - Namespace 찾기
   - Room 찾기
   - `addMessage()` 메서드로 히스토리에 추가

### 히스토리 조회하기

새로운 사용자가 Room에 조인할 때 히스토리를 전송합니다:

```javascript
// 서버 측 (joinRoom 이벤트 핸들러 내부)
const thisRoomsHistory = thisRoomObj.history;

ackCallBack({
    numUsers: socketCount,
    thisRoomsHistory,  // 히스토리 전송
})
```

```javascript
// 클라이언트 측 (joinRoom.js)
ackResp.thisRoomsHistory.forEach(message => {
    document.querySelector('#messages').innerHTML += buildMessageHtml(message)
})
```

### 히스토리 초기화하기

```javascript
// Room 클래스의 clearHistory() 메서드 사용
thisRoom.clearHistory();  // history = []
```

---

## 전체 흐름 다이어그램

### Room 생성 및 사용 전체 흐름

```
┌─────────────────────────────────────────────────────────────┐
│                    서버 시작 (slack.js)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Namespace와 Room 초기화 (data/namespaces.js)            │
│     - Namespace 생성                                         │
│     - Room 생성 및 Namespace에 추가                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. 클라이언트 연결                                          │
│     클라이언트 → 서버: 'clientConnect' 이벤트                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Namespace 목록 전송                                      │
│     서버 → 클라이언트: 'nsList' 이벤트 (namespaces 배열)     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 클라이언트: Namespace 선택                               │
│     - joinNs() 함수 호출                                     │
│     - Room 목록을 UI에 표시                                  │
│     - 첫 번째 Room 자동 조인                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. 클라이언트: Room 조인 요청                               │
│     클라이언트 → 서버: 'joinRoom' 이벤트                     │
│     { roomTitle: "New Articles", namespaceId: 0 }           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  6. 서버: Room 조인 처리                                     │
│     - 기존 Room에서 나가기 (socket.leave)                    │
│     - 새 Room에 조인 (socket.join)                          │
│     - 사용자 수 계산                                         │
│     - 히스토리 가져오기                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  7. 서버 → 클라이언트: 조인 응답                             │
│     { numUsers: 3, thisRoomsHistory: [...] }                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  8. 클라이언트: UI 업데이트                                  │
│     - 현재 Room 제목 표시                                    │
│     - 사용자 수 표시                                         │
│     - 메시지 히스토리 표시                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  9. 메시지 전송                                              │
│     클라이언트 → 서버: 'newMessageToRoom' 이벤트             │
│     서버: Room의 모든 사용자에게 메시지 전송                 │
│     서버: 히스토리에 메시지 추가 (addMessage)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 실전 예제 코드

### 예제 1: 새로운 Namespace와 Room 생성하기

```javascript
// data/namespaces.js에 추가

const Namespace = require('../classes/Namespace');
const Room = require('../classes/Room');

// 새로운 Namespace 생성
const myNs = new Namespace(
    3,  // id
    'My Project',  // name
    'https://example.com/logo.png',  // image
    '/myproject'  // endpoint
);

// 여러 Room 추가
myNs.addRoom(new Room(0, 'General', 3));  // 공개 방
myNs.addRoom(new Room(1, 'Development', 3));  // 공개 방
myNs.addRoom(new Room(2, 'Private Chat', 3, true));  // 비공개 방

// namespaces 배열에 추가
const namespaces = [wikiNs, mozNs, linuxNs, myNs];
module.exports = namespaces;
```

### 예제 2: 동적으로 Room 추가하기

```javascript
// slack.js에 새로운 엔드포인트 추가

app.post('/api/rooms', (req, res) => {
    const { namespaceId, roomTitle, privateRoom } = req.body;
    
    // Namespace 찾기
    const namespace = namespaces.find(ns => ns.id === namespaceId);
    if (!namespace) {
        return res.status(404).json({ error: 'Namespace not found' });
    }
    
    // 새 Room 생성
    const newRoomId = namespace.rooms.length;  // 다음 ID
    const newRoom = new Room(newRoomId, roomTitle, namespaceId, privateRoom || false);
    
    // Namespace에 추가
    namespace.addRoom(newRoom);
    
    // 해당 Namespace의 모든 클라이언트에게 알림
    io.of(namespace.endpoint).emit('nsChange', namespace);
    
    res.json({ success: true, room: newRoom });
});
```

### 예제 3: Room 목록 조회 API

```javascript
// slack.js에 추가

app.get('/api/namespaces/:namespaceId/rooms', (req, res) => {
    const namespaceId = parseInt(req.params.namespaceId);
    const namespace = namespaces.find(ns => ns.id === namespaceId);
    
    if (!namespace) {
        return res.status(404).json({ error: 'Namespace not found' });
    }
    
    res.json({
        namespace: namespace.name,
        rooms: namespace.rooms.map(room => ({
            roomId: room.roomId,
            roomTitle: room.roomTitle,
            privateRoom: room.privateRoom,
            messageCount: room.history.length
        }))
    });
});
```

### 예제 4: Room 히스토리 조회 API

```javascript
// slack.js에 추가

app.get('/api/namespaces/:namespaceId/rooms/:roomTitle/history', (req, res) => {
    const namespaceId = parseInt(req.params.namespaceId);
    const roomTitle = req.params.roomTitle;
    
    const namespace = namespaces.find(ns => ns.id === namespaceId);
    if (!namespace) {
        return res.status(404).json({ error: 'Namespace not found' });
    }
    
    const room = namespace.rooms.find(r => r.roomTitle === roomTitle);
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({
        roomTitle: room.roomTitle,
        history: room.history
    });
});
```

---

## 주의사항 및 보안 고려사항

### 1. Room Title 검증

**문제점**:
```javascript
// 위험한 코드
socket.join(roomObj.roomTitle);  // 클라이언트가 보낸 roomTitle을 그대로 사용
```

**문제**: 클라이언트가 악의적인 Room 이름을 보낼 수 있음

**해결책**:
```javascript
socket.on('joinRoom', async (roomObj, ackCallBack) => {
    // 1. Namespace에서 Room 존재 여부 확인
    const thisNs = namespaces[roomObj.namespaceId];
    const thisRoomObj = thisNs.rooms.find(room => room.roomTitle === roomObj.roomTitle);
    
    // 2. Room이 존재하지 않으면 에러 반환
    if (!thisRoomObj) {
        return ackCallBack({ error: 'Room not found' });
    }
    
    // 3. 검증된 Room Title 사용
    socket.join(thisRoomObj.roomTitle);
    
    // ... 나머지 코드
});
```

### 2. 권한 검증

**문제점**: 모든 사용자가 모든 Room에 접근 가능

**해결책**:
```javascript
socket.on('joinRoom', async (roomObj, ackCallBack) => {
    const thisRoomObj = thisNs.rooms.find(room => room.roomTitle === roomObj.roomTitle);
    
    // 비공개 Room인 경우 권한 확인
    if (thisRoomObj.privateRoom) {
        const user = getUserFromSocket(socket);  // 사용자 정보 가져오기
        
        if (!hasRoomAccess(user, thisRoomObj)) {
            return ackCallBack({ error: 'Access denied' });
        }
    }
    
    // 권한이 있으면 조인
    socket.join(thisRoomObj.roomTitle);
    // ... 나머지 코드
});
```

### 3. 메시지 히스토리 크기 제한

**문제점**: 히스토리가 무한정 커질 수 있음

**해결책**:
```javascript
// Room 클래스에 메서드 추가
class Room {
    // ... 기존 코드 ...
    
    addMessage(message) {
        this.history.push(message);
        
        // 최대 100개 메시지만 유지
        const MAX_HISTORY = 100;
        if (this.history.length > MAX_HISTORY) {
            this.history = this.history.slice(-MAX_HISTORY);
        }
    }
}
```

### 4. Room Title 중복 방지

**문제점**: 같은 Namespace 내에서 같은 이름의 Room이 여러 개 생성될 수 있음

**해결책**:
```javascript
addRoom(roomObj) {
    // 중복 확인
    const exists = this.rooms.some(room => room.roomTitle === roomObj.roomTitle);
    if (exists) {
        throw new Error(`Room "${roomObj.roomTitle}" already exists`);
    }
    
    this.rooms.push(roomObj);
}
```

### 5. 입력값 검증

**문제점**: 잘못된 데이터 타입이나 값이 들어올 수 있음

**해결책**:
```javascript
socket.on('joinRoom', async (roomObj, ackCallBack) => {
    // 타입 검증
    if (typeof roomObj.roomTitle !== 'string' || roomObj.roomTitle.trim() === '') {
        return ackCallBack({ error: 'Invalid room title' });
    }
    
    if (typeof roomObj.namespaceId !== 'number') {
        return ackCallBack({ error: 'Invalid namespace ID' });
    }
    
    // ... 나머지 코드
});
```

---

## 자주 묻는 질문

### Q1: Room과 Namespace의 차이는 무엇인가요?

**A**: 
- **Namespace**: Socket.IO 연결의 논리적 분리 (예: `/wiki`, `/mozilla`)
- **Room**: Namespace 내에서 Socket들을 그룹화하는 메커니즘 (예: "New Articles", "Editors")

**비유**:
- Namespace = 건물
- Room = 건물 안의 개별 방

### Q2: 한 사용자가 여러 Room에 동시에 참여할 수 있나요?

**A**: 이 예제에서는 한 번에 하나의 Room만 참여하도록 구현되어 있습니다. 하지만 Socket.IO는 여러 Room에 동시 참여를 지원합니다:

```javascript
// 여러 Room에 동시 참여 가능
socket.join('room1');
socket.join('room2');
socket.join('room3');
```

### Q3: Room이 삭제되면 어떻게 되나요?

**A**: 현재 코드에는 Room 삭제 기능이 없습니다. 추가하려면:

```javascript
// Namespace 클래스에 메서드 추가
removeRoom(roomTitle) {
    this.rooms = this.rooms.filter(room => room.roomTitle !== roomTitle);
}

// 사용 예시
namespace.removeRoom('Old Room');
```

### Q4: Room의 메시지 히스토리는 서버 재시작 시 사라지나요?

**A**: 네, 현재는 메모리에만 저장되므로 서버 재시작 시 사라집니다. 영구 저장을 위해서는 데이터베이스에 저장해야 합니다:

```javascript
// 예시: MongoDB 사용
const Room = require('./models/Room');  // Mongoose 모델

// 메시지 저장
await Room.findOneAndUpdate(
    { roomTitle: currentRoom },
    { $push: { history: messageObj } }
);
```

### Q5: Room에 있는 사용자 목록을 어떻게 가져오나요?

**A**: `fetchSockets()` 메서드를 사용합니다:

```javascript
const sockets = await io.of(namespace.endpoint).in(roomTitle).fetchSockets();
const users = sockets.map(socket => socket.handshake.query.userName);
console.log(users);  // ['John', 'Jane', 'Bob']
```

### Q6: Room이 비어있을 때 자동으로 삭제할 수 있나요?

**A**: 가능합니다. 사용자가 Room을 나갈 때 확인하면 됩니다:

```javascript
socket.on('disconnect', () => {
    const rooms = socket.rooms;
    rooms.forEach(room => {
        if (room !== socket.id) {  // 개인 Room 제외
            io.of(namespace.endpoint).in(room).fetchSockets().then(sockets => {
                if (sockets.length === 0) {
                    // Room이 비어있으면 삭제
                    namespace.removeRoom(room);
                }
            });
        }
    });
});
```

---

## 요약

### 핵심 개념

1. **Room 생성**: `new Room(roomId, roomTitle, namespaceId, privateRoom)`
2. **Namespace에 추가**: `namespace.addRoom(room)`
3. **Room 조인**: `socket.join(roomTitle)`
4. **메시지 전송**: `io.of(endpoint).in(roomTitle).emit('event', data)`
5. **히스토리 관리**: `room.addMessage(message)`, `room.history`

### 주요 메서드

- **서버 측**:
  - `socket.join(roomTitle)`: Room에 조인
  - `socket.leave(roomTitle)`: Room에서 나가기
  - `io.of(endpoint).in(roomTitle).emit()`: Room의 모든 사용자에게 메시지 전송
  - `io.of(endpoint).in(roomTitle).fetchSockets()`: Room의 모든 Socket 가져오기

- **클라이언트 측**:
  - `socket.emitWithAck('joinRoom', data)`: Room 조인 요청 및 응답 대기
  - `socket.on('messageToRoom', callback)`: Room 메시지 수신

### 다음 단계

1. 데이터베이스 연동 (Room과 메시지 영구 저장)
2. 인증 및 권한 시스템 구현
3. 파일 업로드 기능 추가
4. 실시간 타이핑 표시 기능
5. 알림 시스템 구현

---

**작성일**: 2024년
**버전**: 1.0
**작성자**: 개발 가이드
