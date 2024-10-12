---
title: "IEEE VICTORIS 3.0"
classes: wide
header:
  teaser: /assets/images/Covers/IEEE-VICTORIS-3.0.jpg
ribbon:   Turquoise
description: "Write-Up for 2 Reverse challenges and 2 OSINT challenges from the IEEE VICTORIS 3.0 CTF."
categories:
  - Reverse Engineering
toc: true
---



# **IEEE VICTORIS 3.0**

## **w3lcome**

- **Category**: Reverse
- **Difficulty**: Easy
- **Link**: [Here](https://mega.nz/file/wuUmiIBK#BREDirj3A0u9ve9HKc2Rk5CgXFe_psfPZ-FbDXoDpmg)

### **General information:**

>Type :  EXE     
CPU :  32-bit      
Subsystem :  Console      
Language: C#        
Packing :   NO          

### **Running the binary:**
First, let's run the program:

![alt text](/assets/images/reverse-engineering/IEEE-VICTORIS-3.0/runnnig_binary.png)

So, it's a straight forward binary, we just need to find the correct password.

### **Analysis:**
Now, let's open our binary in **dnSpy**, we see the previously printed strings. followed by a `Console.ReadLine()`, then have a length check to make sure that our input is equal to `15`, otherwise it will print `Sorry, wrong password!`

After that, a random number is generated using the `Random` class, and a value `num2` is computed based on the random number, password length, and the sum of the ASCII values

Then creates a new byte `array` array of the same length as `program.secret`. For each byte in the `secret`, an XOR operation is performed with `num2`, and the result is stored in `array`

![alt text](/assets/images/reverse-engineering/IEEE-VICTORIS-3.0/Code.png)

Double-clicking on `secret` to see what is inside, We see that the secret field is an array of bytes, and it is used in the XOR operation in the previously code to generate the token. The array contains a predefined set of byte values, which range from 168 to 255.

![alt text](/assets/images/reverse-engineering/IEEE-VICTORIS-3.0/secret.png)

**Summary**:
- The program reads a 15-character password from the user.
- It calculates a random value based on the sum of ASCII values of the password characters and a random number.
- It performs an XOR operation on the secret data with this calculated value.
- The result is displayed as a token to the user.


### Solution:
I wrote the following python script to loop over all possible values of num2 (from 0 to 255).

```py
import string

# Initialize the secret byte array
secret = [
    210, 222, 222, 222, 224, 255, 171, 239, 245, 168, 239, 196, 254, 168, 225, 
    226, 196, 227, 171, 233, 196, 236, 170, 239, 243, 196, 247, 170, 246, 170, 
    239, 168, 255, 196, 240, 168, 226, 232, 235, 250, 248, 254, 230
]

# Brute-force all possible values for num2 (from 0 to 255)
for num2 in range(256):
    # XOR the secret array with the current num2 value
    decoded = ''.join([chr(byte ^ num2) for byte in secret])
    
    # Check if the decoded message contains only printable characters
    if all(c in string.printable for c in decoded):
        print(f'num2: {num2}, Decoded message: {decoded}')
```

***NOTE:*** *The script checks if the decoded message contains only printable characters (using Python's string.printable) and prints the value of num2 along with the decoded message.*

**Running the script**

After running the script, we can see our flag in the last iteration.

![alt text](/assets/images/reverse-engineering/IEEE-VICTORIS-3.0/running_Xor_script.png)

### Flag:
<span style="color:#00FFFF;">**IEEE{d0tn3t_e3zy_x0r_w1th_l1m1t3d_k3yspace}**</span>

___
___


## **bibibi**

- **Category**: Reverse

- **Difficulty**: Medium
- **Link**: [Here](https://mega.nz/file/tiEBAJgb#z9JyVrxJybRiizhinpHjRJqhRRSy2mDaeghbakjHa4o)


*First we have an `ELF` file and a `TXT` file., let's start with the ELF.*
### **General information:**

>Type :  ELF     
CPU :  64-bit      
Subsystem :  Console      
Language: C/C++        
Packing :   NO          

### **Running the binary:**
First, let's run the program:

![alt text](/assets/images/reverse-engineering/IEEE-VICTORIS-3.0/runnnig_binary2.png)

The program seems to encode our input somehow and print it, the mission is to find the right input that generates the string in the `.txt` file.

### **Analysis:**
At the beginning, I tried to analyze it statically with IDA, but it was way complicated, so I moved on to dynamic analysis using `IDA Remote Debugger`.

First, I set a bp at where the usr is asked for input, but I ended up getting this error several times:

>4088FD: got SIGVTALRM signal (Virtual alarm clock) (exc.code 1a, tid 5125)

After some research, I found out that this is error is generated because the binary sets a virtual timer using the `setitimer()` system call, which causes the `SIGVTALRM` signal to be delivered when the timer expires.

I debugged the binary slowly until I found the call to `setitimer()` and replaced it with `nop` and fixed the return value, now we can debug the program more easily.

After heavy debugging, I still don't understand how the encode is done, so I moved to a quicker way.

Since we have the desired output, why can't we just brute-force it?, So, I wrote the following Python script to automate the process and tried to make it as simple as possible so that it runs quickly:

```py
import itertools
import string
import subprocess

# Define the binary path and the input value
binary_path = './Patched'  

# Define the desired output
desired_output = "E&M*~;,%#<2N]/~J3E*?&*F<E!,Y%\;;S*:\=%8N%NORN*~?G%14WG;;+*W1*RWX^E*'2*?+*U*FU\%2|G4,X:I>%I%'S93W4%1O7,Z&;*?NE!D$~#|]ISR**^EZW,E>"

# Define the character set (uppercase, lowercase, digits, and underscore)
charset = string.ascii_uppercase + string.digits + '_' + '+'

# Fixed prefix
prefix = ''

# Length of the remaining characters
remaining_length = 128

# Function to brute force the remaining characters
def brute_force():
    for suffix in itertools.product(charset, repeat=1):
        # Join the prefix and the current suffix to form the full input
        input_value = prefix + ''.join(suffix)
        yield input_value


if __name__ == "__main__":
    for itration in range (remaining_length):
        for attempt in brute_force():
            input_value = attempt
            try:
                # Run the binary and provide input
                process = subprocess.Popen(binary_path, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

                # Communicate with the process to send the input and capture output
                output, error = process.communicate(input=input_value.encode())

                # Print the output and any errors
                if output:
                    f_output = output.decode()[30:(30+len(input_value))] # Delete the string printed before the output
                    if f_output == desired_output[:len(f_output)]:
                        prefix = input_value
                        break  # Move to the next iteration after finding a match



                if error:
                    print("Error:", error.decode())

            except FileNotFoundError:
                print(f"Error: The binary '{binary_path}' was not found.")

            except Exception as e:
                print(f"An error occurred: {str(e)}")


print(prefix)
```

### Running the script: 

After running the script for only 10 seconds, we have got our flag.

![alt text](/assets/images/reverse-engineering/IEEE-VICTORIS-3.0/running_2nd_script.png)

### Flag:
<span style="color:#00FFFF;">**IEEE{IDK_MAN_THIS+FEELS_SO_EASY_I_TOLD_YOU_TO_TAKE_THE_HARDWAY_NO_TOOLS_NO_HS_DECOMPILER_ONLY_ASSEMBLY_AND_GDB_STEP+STEP+STEP_THEN_S1}**</span>

___
___

## **Kattaketo**

- **Category**: OSINT
- **Difficulty**: Easy
- **Link**: [Here](https://mega.nz/file/VuViFT6J#w4hEz6IIYSSewyXZ08pupRsKo_Zdf9aebcl-YWMRRPg)

### Description:
I was on a mission to track down a notorious cybercriminal, someone responsible for a series of high-profile cyberattacks. My latest intel revealed that he was planning a fresh strike on a famous restaurant chain that had already been hit, leaking sensitive data. Through some clever digging, I managed to retrieve a single image of the place he was spotted—a quiet café, but the clues were all there. Now, it’s up to you. track him down, and uncover where he was before he disappears again. Time is ticking.

Flag Format: `IEEE{**-*******}`

### Solution:

First, I tried to search the full image on google lens, but I didn't found somwthing useful, So I decided to take it part by part.

I noticed the reversed word on the umbrella `Bazooka` -which is a famous fried chicken restaurant- and a flag for `Cup & Task` cafe in the other side, I started to searching on google maps for any branchs of `Bazooka` that is near to a branch of `Cup & task`.


I have got a match on `Orium mall` at `El-Shorouk` city, so I tried that and I got the point.

![alt text](/assets/images/reverse-engineering/IEEE-VICTORIS-3.0/map.png)

### Flag:

<span style="color:#00FFFF;">**IEEE{El-Shorouk}**</span>


## <span dir="rtl">المصفوع</span>

- **Category**: OSINT
- **Difficulty**: Easy

### Description:

In a sudden eruption of chaos, a former writer for a famous American media personality struck a man in the face multiple times before running away. Witnesses were left in shock, and now, a crucial question remains: who was the man she attacked? Your mission is to uncover his identity and reveal the story behind this enigmatic encounter.
Flag Format: IEEE{FirstName_LastName}

### Solution:
All I had to do is to search on google with the phrase `A writer for American media personality struck a man in the face multiple times` and from the [first website](https://pagesix.com/2024/04/09/celebrity-news/former-howard-stern-show-writer-elisa-jordana-arrested-after-repeatedly-hitting-man/) I got the female writer's name

The article only mentioned the man as `Zscorro` but never mentioned his real-name, So I start to search on `Who is Zscorro` `Elisa Jordana's boyfriend` and I found his name [here](https://www.wikibiostar.com/articles/who-is-elisa-jordana-boyfriend-zscorro-and-what-happened-to-him/)


### Flag:

<span style="color:#00FFFF;">**IEEE{Bahram_Alipour}**</span>


___
___

<p align="center"><span style="color:#00FFFF;">THE END</span></p>


___
___