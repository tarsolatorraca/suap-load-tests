repeat=10
echo -e "\nExecutando $repeat testes..."

i=0
while (( i++ < repeat )); do
	echo "Executando teste de carga $i de $repeat no SUAP..."
	jmeter -n -t mpes-suap.jmx -l suap-teste$i.csv

	echo "Gerando dashboard do teste $i de $repeat do SUAP..."
	jmeter -g suap-teste$i.csv -o dashboard-suap-teste$i/

	echo "Aguardando 60 segundos para rodar o proximo teste..."
	sleep 60
done

