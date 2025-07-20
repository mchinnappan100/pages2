echo sf mohanc md describe -u $1  -s $2  -e  $2.svg > $2.csv
sf mohanc md describe -u $1  -s $2  -e  $2.svg > $2.csv && open "$2.svg"
