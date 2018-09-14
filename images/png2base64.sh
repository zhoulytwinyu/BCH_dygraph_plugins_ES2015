#!/usr/bin/bash
for i in *.png; do base64 $i>$i.txt; done
