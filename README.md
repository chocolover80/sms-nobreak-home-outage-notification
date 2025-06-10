<img src="https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/sms-home-agent-logo.png" align="right" height="64px" />

# sms-nobreak-home-outage-notification

Esta aplicação visa coletar os status dos botões do meu Nobreak pessoal da SMS, que eu possuo em minha casa. Ela irá monitorar (via webscrapping com node.js e puppeteer) o status atual de cada um dos botões (que são mostrados em um IP dedicado dentro da minha rede), salvar os dados em um arquivo de Log em formato JSON, e então enviar um email sempre que houver oscilações, ou recuperações de oscilações anteriores na energia do aparelho.

![Prévia da página home do gerenciamento do nobreak SMS](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/ups-management-homepage.png) 

Antes de mais nada, vamos aos passos da instalação.

# Setup do Agente
Aprenda como configurar corretamente o agente para que possa capturar seus dados.

### 1 - Dependências (necessário que você tenha em seu setup):
**- 1.1 Nobreak SMS compatível & Net Adapter II / máquina para executar o código:** Esse item é o básico do básico para o funcionamento de tudo que este guia contempla. A SMS é uma das maiores empresas de nobreaks e aparelhos energéticos em geral no Brasil, e como tal, oferece diversas linhas de Nobreaks e acessórios. O que você precisará é de um Nobreak que seja compativel com o aparelho Net Adapter II, vendido pela Legrand SMS. No meu setup, foi utilizado:
- [Power Sinus NG 3200VA](https://www.sms.com.br/governo/produtos/nobreaks/line-interactive-senoidal/power-sinus-ng-3200-va); 
- [Net Adapter II (externo) SMS](https://www.sms.com.br/produtos/acessorios/gerenciamento/net-adapter-ii-externo);
- [Raspberry Pi4](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/);
>Você pode encontrar informações sobre os dois primeiros produtos acima no ([site oficial da SMS](www.sms.com.br/)), assim como pode comprpa-los em seus revendedores no Brasil (pesquisando na Kabum, MercadoLivre, Amazon e afins)

Uma vez que você os tenha em seu setup e esteja tudo funcionando, você vai precisar ter obviamente também possuir conexão de internet, e algum dispositivo capaz de executar Node.js. No meu caso, utilizei um servidor dedicado, mais especificamente um raspberry pi4, com windows arc instalado. É um tanto lento, mas serve à finalidade proposta. Caso deseje utilizar distros linux ou até MAC, contanto que possua o Node.js instalado, funcionará, já que o Net Adapter e o Nobreak se baseiam unicamente na comunicação entre eles, e não em um SO específico e afins. Se até mesmo quiser rodar através de um aparelho portátil, é possível, desde que consiga rodar o Node.js por ele.

**- 1.2 Node.js:** A codificação do agente foi toda feita baseada na versão 22.16.0 do node + 10.9.2 do npm. Porém testei com versões anteriores, e funcionou sem maiores problemas. Tente manter o node instalado na máquina de onde executará o agente entre a versão 20 e a 22 e deverá funcionar tudo ok!

### 2 - Baixando e configurando o Agente:
Não optei por utilizar releases no projeto, dado o fato que gerar deployments dele me demandaria criação de um frontend (fosse uma janela num .exe ou uma webpage), então você precisará baixar um zip do repositório, e ela já te dará praticamente tudo o que você necessitará para que tudo funcione. Precisará apenas configurar alguns pontos, conforme faremos abaixo nos próximos passos. :)

**- 2.1 Baixando os arquivos:** 
- Navegue até o [repositório do projeto](https://github.com/chocolover80/sms-nobreak-home-outage-notification), clique em "<> Code", e escolha baixar o .zip. Conforme abaixo:
![Prévia da instrução de download do código do Agente]() 