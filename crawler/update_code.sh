#!/bin/bash

# ip_array=("47.97.32.55" "192.168.1.2" "192.168.1.3")  
ip_array=("47.97.32.55")  
user="root"  
remote_cmd="/server"  
  
#本地通过ssh执行远程服务器的脚本  
for ip in ${ip_array[*]}  
do  
    # if [ $ip = "192.168.1.1" ]; then  
    #     port="7777"  
    # else  
    #     port="22"  
    port="22"
    fi  
    ssh -t -p $port $user@$ip "cd /server;git pull;pm2 reload all"  
done  
echo done