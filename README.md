##FOR DEVMERGE

##TEAM MONOMER

##LICENSE MIT

#To create CRT use:

openssl req -x509 -newkey rsa:4096 -sha256 -nodes -keyout example.key -out example.crt -subj "/CN=monomer.fr.openode.io/O=IN/emailAddress=karthik@devmerge/L=123" -days 3650
