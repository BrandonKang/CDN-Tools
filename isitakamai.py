#isitakamai.py developed by Brandon Kang
#Jan 21 2016

import sys
import socket
import dns.resolver

def is_valid_ipv4_address(address):
    try:
        socket.inet_pton(socket.AF_INET, address)
    except AttributeError:  # no inet_pton here, sorry
        try:
            socket.inet_aton(address)
        except socket.error:
            return False
        return address.count('.') == 3
    except socket.error:  # not a valid address
        return False

    return True

def is_valid_ipv6_address(address):
    try:
        socket.inet_pton(socket.AF_INET6, address)
    except socket.error:  # not a valid address
        return False
    return True

def getCname(domain):
	try:
		answers = dns.resolver.query(domain, 'CNAME')
		for rdata in answers:
			return(rdata.target)
	except:
		return('No CNAME is found')

def getArecords(domain):
	try:
		answer=dns.resolver.query(domain, 'A')
		for data in answer:
			return(data.address)
	except:
		return('No A record is found')

def nslooky(ip):
      try: 
            output = socket.gethostbyaddr(ip)
            return output[0]
      except: 
           	output = 'not found.' 
           	return output

def reverseResult(result):
	try:
		print('DNS Reverse Lookup Result: {0}'.format(result))
	except:
		print('DNS Reverse Lookup Failed.')

	print('\n')

def reverseCalc(ip_address):
	result = nslooky(ip_address)
	if result.find('akamaitechnologies') > -1:
		print('The IP({0}) belongs to Akamai.'.format(ip_address))
	else :
		print('The IP({0}) does not belong to Akamai.'.format(ip_address))

	reverseResult(result)

#get an input from the 1st parameter
input = sys.argv[1]

#check if it is an IP
#if yes, start reverse lookup
if(is_valid_ipv4_address(input) == True):
	reverseCalc(input)

#if no, it should be a domain
#check cname and a record to start reverse lookup
else:
	cname = str(getCname(input))
	arecord = str(getArecords(input))
	print('DNS lookup CNAME record : ' + cname)
	print('DNS lookup A record : ' + arecord)

	if(arecord != 'No A record is found'):
		reverseCalc(arecord)

#the end of the code

