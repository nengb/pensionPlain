
 class UserMgr {
    constructor(io,myredis){
        this.io = io;
        this.myredis = myredis;
    }

    //绑定玩家
    async bind(userid,socket){
        let userList = {}
        userList[userid] = socket.id
        return await this.myredis.hmset('userList',userList,true)
    }
    //删除玩家
    async del(userid,socket){
        return await this.myredis.hdel('userList',`${userid}`,true)
    }
    //获取玩家socketId
    async get(userid){
        return await this.myredis.hget('userList',`${userid}`,true)
    }
    //获取在线玩家数量
    async getOnlineCount(){
        return await this.myredis.hlen('userList',true)
    }
    //给玩家发送数据
    async sendMsg(userid,event,msgdata){
        let userSocketId = await this.get(userid);
        this.io ? this.io.to(userSocketId).emit(event,msgdata):console.log(`------------------发送信息失败---------${event}------${msgdata}-------`);
    }

}

module.exports = UserMgr