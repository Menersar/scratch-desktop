# import sys
# print(sys.argv[0]) # prints python_script.py
# print(sys.argv[1]) # prints var1
# print(sys.argv[2]) # prints var2
# # https://stackoverflow.com/questions/14155669/call-python-script-from-bash-with-argument

# sys.stdout = sys.argv[0] + sys.argv[1] + sys.argv[2]


import sys

print('Hello from Python!')
print(f'Received arguments: {sys.argv}')

#
# > python python_script.py var1 var2
# https://stackoverflow.com/questions/14155669/call-python-script-from-bash-with-argument
#
# https://www.digitaldesignjournal.com/can-i-use-python-with-electron/
#

