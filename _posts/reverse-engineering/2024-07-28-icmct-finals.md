---
title: "ICMTC CTF Finals 2024"
classes: wide
header:
  teaser: /assets/images/Covers/ICMTC_cover.png
ribbon:   DodgerBlue
description: "A Write-Up for two of the ICMTC CTF Finals Reverse Engineering challenges "
categories:
  - Reverse Engineering
toc: true
---

# **ICMTC CTF Finals 2024**
## **OperationQak**
### **General information:**

>Type :  EXE     
CPU :  64-bit      
Subsystem :  Console      
Packing :   NO          
MD5 Hash : 046A587250419523A20DB0464ACFC702


### **Running the binary:**
First, Let's run the program:

![Running the binary](/assets/images/reverse-engineering/ICMTC_finals/running1.png)

So, it's a straight forward binary, we just need to find the correct secret key.

### **Analysis:**
Now, let's open our binary in IDA, we see our previous printed strings followed by a call to `sub_140001350` which is a scan function to get our input, after that another call to `sub_140001000` happened then a call to `strcmp` to compare between our input and the return value of `sub_140001000`.

If the comparison was successful, our flag will be printed, otherwise the string **"Authentication FAILED!"** will be printed.

![main function](/assets/images/reverse-engineering/ICMTC_finals/main1.png)

To get the right input, I used x64dbg and set a BP on the call to `strcmp` to see its arguments and that's what I got.

![strcmp arguments](/assets/images/reverse-engineering/ICMTC_finals/strcmp.png)

So, let's try `operation_duck_hunt` as our input, and VOILA! 

![Flag](/assets/images/reverse-engineering/ICMTC_finals/Flag.png)

### **Flag:**

<span style="color:#00FFFF;">**EGCERT{1850093_operation_duck_hunt}**</span>


*Note: the number at beginning of the flag is just the output of `GetTickCount` API call which Retrieves the number of milliseconds that have elapsed since the system was started, this number will change every time we run the binary.*


___
___



## **SimpleObfuscator**
### **General information:**

>Type :  EXE     
CPU :  32-bit      
Subsystem :  Console      
Packing :   NO          
MD5 Hash: 8B057322913A0BF9A313E30FA55CBD82      
Signature: Microsoft Visual C# v7.0 / Basic .NET

### **Running the binary:**
First, Let's run the program:

![Running the binary](/assets/images/reverse-engineering/ICMTC_finals/running2.png)

Again, we need to find the correct password.

### **Analysis:**

Now, let's open our .NET binary in dnSpy, from the first look, we can tell that this is an Obfuscated binary.

![obfuscateed main](/assets/images/reverse-engineering/ICMTC_finals/main2.png)

So, I used `de4dot` to deobfuscate the binary using the following command

```sh
 de4dot -r "C:\Users\husky\Desktop\New folder" -ro deobfuscated
 ```

Now, we have a deobfuscated file that we can reverse easily.

First, the main function is just calling `gj44ampptns` function.

![deobfuscated main](/assets/images/reverse-engineering/ICMTC_finals/main3.png)

Inside the `gj44ampptns` function we see some anti-debugging techniques, then an initialization for two string `b` and `arg`, then the line **"Enter Password: "**  will be printed.

After that our input will be scaned and compared to the string `b`, if they are equal, our flag will be printed, otherwise the string **"Peace Out!"** will be printed.

![gj44ampptns function](/assets/images/reverse-engineering/ICMTC_finals/gj44ampptns.png)



Now, let's have a look on the `b` string, it contains the string `No_On3_Can_Find_My_S3cr37_Pass`

![Password](/assets/images/reverse-engineering/ICMTC_finals/password.png)

Now, let's try `No_On3_Can_Find_My_S3cr37_Pass` as our input, and again VOILA! 

![Flag](/assets/images/reverse-engineering/ICMTC_finals/Flag-2.png)

### **Flag:**

<span style="color:#00FFFF;">**EGCERT{n00b_0bfuscat0r_taopetc3jcd}**</span>

*Note: the string "taopetc3jcd" at the end of the flag is also random string generated from  the use of Program.cy5azpmunsa() as second argument to  string.Format() function, this string will change every time we run the binary.*

### **SAD NEWS:**

Unfortunately, When I finally got this flag and went to sumbit it, I found out the CTF has ended two minutes ago.

![SAD MAN](/assets/images/reverse-engineering/ICMTC_finals/sad_man.jpeg)


___
___

<p align="center"><span style="color:#00FFFF;">THE END</span></p>


___
___