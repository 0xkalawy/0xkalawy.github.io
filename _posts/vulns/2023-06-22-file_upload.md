---
title: "File Upload basic Vulnerabilities"
classes: wide
header:
  teaser: /assets/images/Covers/file_upload.png
ribbon:   DodgerBlue
description: "These Vulnerabilities arise when the server fails to enforce restrictions on the properities of the files uploaded to its system (eg: name, type, content, or size)."
categories:
  - Vulnerabilities
toc: true
---

When the developer doesn't give enough concern to a critical function like File Upload, for sure attackers give instead :(

# File Upload Filters

1. **Extension Validation**: validates the file extension
1. **File Type Filtering**: validate the Content-Typeheader
    - **MIME validation**: MIME (**M**ultipurpose **I**nternet **M**ail **E**xtension) types are used as an identifier for files - originally when transferred as attachments over email, but now also when files are being transferred over HTTP(S). The MIME type for a file upload is attached in the header of the request
    - **Magic Number validation**: Magic numbers are the more accurate way of determining the contents of a file; although, they are by no means impossible to fake. The "magic number" of a file is a string of bytes at the very beginning of the file content which identifies the content. For example, a PNG file would have these bytes at the very top of the file: `89` `50` `4E` `47` `0D` `0A` `1A` `0A`.

1. File Length Filtering
1. File Name Filtering
1. File Content Filtering

> Content-Type header is used to tell the client or the server which data is sent. each content-type value is divided into Type and Subtype separated by /. you can read the common types and subtypes from [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types).

# Attacks

## Flawed file-type validation

many servers accept only data with specific `Content-Type` values (i.e. image/png). if the server doesn't do any further validation, the attacker can modify the Content-Typewith burp proxy and then bypass the validation.

## Preventing file execution in user-accessible directories

Another way that the server used to prevent file upload vulnerabilities is to stop executing any file in the user-accessible directories.

<iframe src="https://giphy.com/embed/b8RfbQFaOs1rO10ren" width="480" height="400" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>

uch a great way. but if the `filename` parameter in the request is vulnerable to directory traversal, you can upload the file to another path and then it will be executed.

## Overriding the server configuration

for the server to execute a script, it should be configured to do that. the developer should include the module that will execute that script. this configuration file in Linux `.htaccess` and in IIS is `web.config`.

> When files are uploaded to the server, a range of checks should be carried out to ensure that the file will not overwrite anything which already exists on the server. Common practice is to assign the file with a new name — often either random or with the date and time of upload added to the start or end of the original filename. Alternatively, checks may be applied to see if the filename already exists on the server; if a file with the same name already exists then the server will return an error message asking the user to pick a different file name. File permissions also come into play when protecting existing files from being overwritten. Web pages, for example, should not be writeable to the web user, thus preventing them from being overwritten with a malicious version uploaded by an attacker.

to exploit this vulnerability you will upload two different files first will override the configuration file and the second will be the exploitation file.

```xml
<!-- first file in IIS-->
<staticContent>
    <mimeMap fileExtension=".json" mimeType="application/json" />
</staticContent>

<!-- first file in Linux -->
LoadModule php_module /usr/lib/apache2/modules/libphp.so
AddType application/x-httpd-php .php
```
## Obfuscating file extensions

these tricks are helpful if the server validates the file extension:

- Provide multiple extensions. Depending on the algorithm used to parse the filename, the following file may be interpreted as either a PHP file or a JPG image: `exploit.php.jpg`
- Add trailing characters. Some components will strip or ignore trailing whitespaces, dots, and suchlike: `exploit.php`.
Try using URL encoding (or double URL encoding) for dots, forward slashes, and backward slashes. If the value isn’t decoded when validating the file extension but is later decoded server-side, this can also allow you to upload malicious files that would otherwise be blocked: `exploit%2Ephp`
Add semicolons or URL-encoded null byte characters before the file extension. If validation is written in a high-level language like PHP or Java, but the server processes the file using lower-level functions in C/C++, for example, this can cause discrepancies in what is treated as the end of the filename: `exploit.asp;.jpg` or `exploit.asp%00.jpg`
Try using multibyte Unicode characters, which may be converted to null bytes and dots after unicode conversion or normalization. Sequences like `xC0 x2E`, `xC4 xAE` or `xC0 xAE` maybe translated to `x2E` if the filename is parsed as a UTF-8 string, but then converted to ASCII characters before being used in a path.

Other defenses involve stripping or replacing dangerous extensions to prevent the file from being executed. If this transformation isn’t applied recursively, you can position the prohibited string in such a way that removing it still leaves behind a valid file extension. For example, consider what happens if you strip `.php` from the following filename: `exploit.p.phphp`

## Flawed validation of the file’s contents

he best way to secure the server from file upload vulnerabilities is to validate the actual content.

Similarly, certain file types may always contain a specific sequence of bytes in their header or footer. These can be used like a fingerprint or signature to determine whether the contents match the expected type. For example, JPEG files always begin with the bytes `FF D8 FF`.

also we can obfuscate this validation by inject our PHP code in a photo by `exiftool`.

```bash
exiftool -Comment="<?php echo 'START ' . file_get_contents('/home/carlos/secret') . ' END'; ?>" <YOUR-INPUT-IMAGE>.jpg -o polyglot.php
```

# Try Hack Me Method for finding file upload

1. The first thing we would do is take a look at the website as a whole. Using browser extensions such as the aforementioned Wappalyzer (or by hand) we would look for indicators of what languages and frameworks the web application might have been built with. Be aware that Wappalyzer is not always 100% accurate. A good start to enumerating this manually would be by making a request to the website and intercepting the response with Burpsuite. Headers such as `server` or `x-powered-by` can be used to gain information about the server. We would also be looking for vectors of attack, like, for example, an upload page.
1. Having found an upload page, we would then aim to inspect it further. Looking at the source code for client-side scripts to determine if there are any client-side filters to bypass would be a good thing to start with, as this is completely in our control.
1. We would then attempt a completely innocent file upload. From here we would look to see how our file is accessed. In other words, can we access it directly in an uploads folder? Is it embedded in a page somewhere? What’s the naming scheme of the website? This is where tools such as Gobuster might come in if the location is not immediately obvious. This step is extremely important as it not only improves our knowledge of the virtual landscape we’re attacking, but it also gives us a baseline “accepted” file on which we can base further testing on.
- An important Gobuster switch here is the `x` switch, which can be used to look for files with specific extensions. For example, if you added `x php,txt,html` to your Gobuster command, the tool would append `.php`, `.txt`, and `.html` to each word in the selected wordlist, one at a time. This can be very useful if you've managed to upload a payload and the server is changing the name of uploaded files.

1. Having ascertained how and where our uploaded files can be accessed, we would then attempt a malicious file upload, bypassing any client-side filters we found in step two. We would expect our upload to be stopped by a server-side filter, but the error message that it gives us can be extremely useful in determining our next steps.

Assuming that our malicious file upload has been stopped by the server, here are some ways to ascertain what kind of server-side filter may be in place:

- If you can successfully upload a file with a totally invalid file extension (e.g. `testingimage.invalidfileextension`) Then the chances are that the server is using an extension blacklist to filter out executable files. If this upload fails then any extension filter will be operating on a whitelist.
- Try re-uploading your originally accepted innocent file, but this time change the magic number of the file to something that you would expect to be filtered. If the upload fails then you know that the server is using a magic number-based filter.
- As with the previous point, try to upload your innocent file, but intercept the request with Burpsuite and change the MIME type of the upload to something that you would expect to be filtered. If the upload fails then you know that the server is filtering based on MIME types.
- Enumerating file length filters is a case of uploading a small file, then uploading progressively bigger files until you hit the filter. At that point, you’ll know what the acceptable limit is. If you’re very lucky then the error message of the original upload may outright tell you what the size limit is. Be aware that a small file length limit may prevent you from uploading the reverse shell we’ve been using so far.

# Mindmap

I love to create mindmap for everything, so:

![mindmap](file://assets/images/_posts/file_upload/mindmap.png)

# Summary
1. When the file name isn’t validated carefully, the attacker can overwrite critical files.
1. When the file content isn’t validated carefully, the attacker can upload server-side code to be executed or upload a web shell and control the whole server.
1. When the file size isn’t validated carefully, the server is vulnerable to Denial of Service.

# Reports
1. [Starbucks File Upload](https://hackerone.com/reports/506646)
1. [Nextcloud file Upload](https://hackerone.com/reports/808287)

# Labs
1. [TryHackMe](https://tryhackme.com/room/uploadvulns)
1. Port Swigger
