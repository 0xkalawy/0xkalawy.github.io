---
title: "Out of Sight ICMTC-2024"
classes: wide
header:
  teaser: /assets/images/Covers/ICMTC_cover.png
ribbon:   DodgerBlue
description: "A Write-Up for ICMTC Reverse challenge Out of Sight"
categories:
  - Reverse Engineering
toc: true
---

# **ICMTC CTF 2024**
## **Out of Sight**
## General information:

>Type :  ELF     
CPU :  64-bit      
Subsystem :  Console      
Packing :   NO

## Running the binary:
First, Let's run the program:

![alt text](/assets/images/reverse-engineering/ICMTC/runinng_the_program.png)

## Static Analysis:
Now, let's go to our previous printed string `Enter The Vault Password Key:`, We can see a called to `sub_565FFA2C942D`  with our input as parameter which looks like encoding method, then a compare between 2 strings, if they are identical we get our flag, otherwise we get "*Access Denied*"

![alt text](/assets/images/reverse-engineering/ICMTC/Static-1.png)

Now, let's open a remote debugger in IDA to see what is happening.

## Dynamic Analysis:

First, we should notice that there is an anti-debugging technique at the beginning, we could just patch this jump to force it to jump to our `loc_5D49C99119B5` always.

![alt text](/assets/images/reverse-engineering/ICMTC/anti-debugging.png)

Now we run our program and insert `input` as our input, we can see that the `_strcmp` is comparing our encoded input with `lvu_krr_uw_blhg`.

![alt text](/assets/images/reverse-engineering/ICMTC/hex_view.png)

Now let's have a look in how `sub_565FFA2C942D` encodes our input.

**Encoding Process**:

   - Loop over each character in `a1` (which contains our input) up to `v14` length.
   - If the character is alphabetical, it performs a shift:
        - If uppercase, it converts it to the range 0-25 (A-Z), applies the key shift, and converts back to uppercase.
        - If lowercase, it does similarly but for the lowercase range (a-z).
   - Non-alphabetical characters are copied unchanged.

![alt text](/assets/images/reverse-engineering/ICMTC/Encoding.png)

After some deep analysis, we can tell that it uses `Vigenère cipher` to encode the input.

 **Example for Vigenère cipher**:
   - Plaintext: "HELLO"
   - Keyword: "KEY"
   - Repeated Keyword: "KEYKE"
   - encoding: 
     - H + K -> R (shift H by 10 places, K is the 11th letter)
     - E + E -> I (shift E by 4 places, E is the 5th letter)
     - L + Y -> J (shift L by 24 places, Y is the 25th letter)
     - L + K -> V (shift L by 10 places, K is the 11th letter)
     - O + E -> S (shift O by 4 places, E is the 5th letter)
   - Ciphertext: "RIJVS"


Instead of trying to debug the whole encoding subroutines to get our key, I used a little tricky way to get our key.

As mentioned, the `Vigenère cipher` use a Repetitive key to shift all of the characters in the plaintext, the alphabetical character values are between 0-25, typically if we use 0 as input (either `a` or `A`),Thus, the ciphertext character directly tells us the key character.

So, I provided `aaaaaaaaaaaaaaaaaaaaaaaa` as input and I got `eh_frame_hdreh_frame_hdr` as encoded value in S2, so our Repetitive key is `eh_frame_hdr` but we know that Non-alphabetical characters aren't accepted in Vigenère cipher so it's a modifed version of it that `_` has a shift value.

After some tries we can tell that if the third character in our input:
-  is `v` will result in `t`.
-  is `m` will result in `k`.
-  is `r` will result in `p`.

So the `_` does a shift left by 2 alphabetical characters which is the same effect of `y` in original Vigenère cipher (shift right by 24 alphabetical characters), that mean that our key could be representd as `ehyframeyhdr`.



## Cyber Chief:

Now as we got our key and we know the ciphertext must equal `lvu_krr_uw_blhg`, we can use cyber chief decoder to get our input.

![alt text](/assets/images/reverse-engineering/ICMTC/cyberchief.png)

Now let's try it 

![alt text](/assets/images/reverse-engineering/ICMTC/flagggggggg.png)

**Yup, we got our flag ;)**

>EGCERT{how_far_is_deep}


___
___

<p align="center"><span style="color:#00FFFF;">THE END</span></p>


___
___