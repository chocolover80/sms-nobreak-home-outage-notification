<img src="https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/sms-home-agent-logo.png" align="right" height="64px" />

# sms-nobreak-home-outage-notification

Esta aplicação visa coletar os status dos botões do meu Nobreak pessoal da SMS, que eu possuo em minha casa. Ela irá monitorar (via webscrapping com node.js e puppeteer) o status atual de cada um dos botões (que são mostrados em um IP dedicado dentro da minha rede), salvar os dados em um arquivo de Log em formato JSON, e então enviar um email sempre que houver oscilações, ou recuperações de oscilações anteriores na energia do aparelho.

![Prévia da página home do gerenciamento do nobreak SMS](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/ups-management-homepage.png) 

Antes de mais nada, vamos aos passos da instalação.

# Setup do Agente
Aprenda como configurar corretamente o agente para que possa capturar seus dados.

### 1 - Dependências (necessário que você tenha em seu setup):
**- 1.1 Nobreak SMS compatível & Net Adapter II / máquina para executar o código:**

Esse item é o básico do básico para o funcionamento de tudo que este guia contempla. A SMS é uma das maiores empresas de nobreaks e aparelhos energéticos em geral no Brasil, e como tal, oferece diversas linhas de Nobreaks e acessórios. O que você precisará é de um Nobreak que seja compativel com o aparelho Net Adapter II, vendido pela Legrand SMS. No meu setup, foi utilizado:
- [Power Sinus NG 3200VA](https://www.sms.com.br/governo/produtos/nobreaks/line-interactive-senoidal/power-sinus-ng-3200-va); 
- [Net Adapter II (externo) SMS](https://www.sms.com.br/produtos/acessorios/gerenciamento/net-adapter-ii-externo);
- [Raspberry Pi4](https://www.raspberrypi.com/products/raspberry-pi-4-model-b/);
>Você pode encontrar informações sobre os dois primeiros produtos acima no ([site oficial da SMS](www.sms.com.br/)), assim como pode comprpa-los em seus revendedores no Brasil (pesquisando na Kabum, MercadoLivre, Amazon e afins)

Uma vez que você os tenha em seu setup e esteja tudo funcionando, você vai precisar ter obviamente também possuir conexão de internet, e algum dispositivo capaz de executar Node.js. No meu caso, utilizei um servidor dedicado, mais especificamente um raspberry pi4, com windows arc instalado. É um tanto lento, mas serve à finalidade proposta. Caso deseje utilizar distros linux ou até MAC, contanto que possua o Node.js instalado, funcionará, já que o Net Adapter e o Nobreak se baseiam unicamente na comunicação entre eles, e não em um SO específico e afins. Se até mesmo quiser rodar através de um aparelho portátil, é possível, desde que consiga rodar o Node.js por ele.

**- 1.2 Node.js:**

A codificação do agente foi toda feita baseada na versão 22.16.0 do node + 10.9.2 do npm. Porém testei com versões anteriores, e funcionou sem maiores problemas. Tente manter o node instalado na máquina de onde executará o agente entre a versão 20 e a 22 e deverá funcionar tudo ok!

### 2 - Baixando e configurando o Agente:
Não optei por utilizar releases no projeto, dado o fato que gerar deployments dele me demandaria criação de um frontend (fosse uma janela num .exe ou uma webpage), então você precisará baixar um zip do repositório, e ela já te dará praticamente tudo o que você necessitará para que tudo funcione. Precisará apenas configurar alguns pontos, conforme faremos abaixo nos próximos passos. :)

**- 2.1 Baixando os arquivos:** 
- Navegue até o [repositório do projeto](https://github.com/chocolover80/sms-nobreak-home-outage-notification), clique em "<> Code", e escolha baixar o .zip. Conforme abaixo:
![Prévia da instrução de download do código do Agente](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/repo-download-instructions.png) 
- Extraia os arquivos para uma pasta de confiança (se estiver utilizando o windows, recomendo criar uma pasta chamada 'node', dentro da raíz do seu disco 'C:', e então dentro dessa parta, extrair o .zip baixado).

**- 2.2 Instalando as dependências do agente:** 

- Dentro da pasta do agente, você precisará acessar uma linha de comando (no windows, você pode usar 'cmd', 'powershell', 'git bash' ou qualquer outro de sua preferência);
- Na linha de comando, você deverá executar o comando "npm i" (ou "npm install"), para que sejam instaladas todas as dependências NPM do projeto. Após executar o comando, as bibliotecas serão instaladas, e a sua pasta deverá ficar parecida com a da foto abaixo:
![Prévia da pasta do agente após instalação das bibliotecas](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/libs-installation-instructions.png)

**- 2.3 Preparando o ambiente com os seus dados pessoais:** 

- **Preparando o arquivo .env com os dados de email e servidor:**
    - O arquivo .env, é um arquivo de ambiente, que conterá dados importantes para que o agente consiga corretamente conectar-se ao ip do seu servidor, e também consiga enviar o email com os alertas.
    - **OBS:** É importante salientar que você vai precisar de algumas configurações de SMTP para o envio de email. Você pode usar aquele que for de sua preferência, mas você vai precisar de fato que ele esteja funcional. Eu recomendo utilizar o SMTP da Google, que oferece disparo de até 500 emails ao dia gratuitamente. Aqui eu deixo um [vídeo tutorial](https://www.youtube.com/watch?v=TrdWr3BmqT8) para que consiga fazer essa configuração. Deixo também essa [ferramenta de teste](https://www.gmass.co/smtp-test) para validar se o envio do email está ok. Uma vez que consiga validar que esteja tudo ok, você configurará os dados de SMTP e IP nesse arquivo .env. Sua configuração no arquivo .env deverá ficar similar ao que está abaixo:
![Prévia do arquivo .env configurado](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/env-file-config-instructions.png)
    - Uma vez que você tenha configurado corretamente o arquivo .env, você apenas precisa movê-lo para dentro da pasta raíz do agente *("sms-nobreak-home-outage-notification")*, e deverá funcionar.
    
# Pondo o agente para funcionar
Colocando o agente para funcionar.

### 1 - Funcionalidade do Agente:

O agente funciona de forma simples: Ele por meio de um código node.js, através de comunicação com uma biblioteca chamada "puppeteer", irá acessar via chrome o endereço de IP do seu Net Adapter II, para então verificar os botões que estão ligados ou desligados na home de monitoração do seu Nobreak SMS, assim validando se é necessário te encaminhar um alerta no email ou não. Embora o acesso seja feito pelo chrome, é tudo executado em background, e você nem verá nada sendo aberto em sua máquina, ou coisa do tipo.

### 2 - Executando o Código:

Para executar o agente, o processo é simplesmente navegar até a pasta raíz do agente *("sms-nobreak-home-outage-notification")*, e com um app de linha de comando de sua preferência (pode ser cmd, powershell, git bash e afins no caso do windows, ou a cli padrão em caso de MAC e Linux), execute o comando *"node index.js"*. Alguns segundos se passarão, e você vai ver alguns logs na sua linha de comando, a depender da situação do seu Nobreak (ou seja, pode ser alerta, aviso de email enviado, nobreak ok e afins). No exemplo abaixo, foi obtido um status ok do Nobreak, onde ele está ok e conectado na rede, sem necessidade de envio de email de alerta.
![Exemplo de CLI retornando logs quando executa o comando 'node index.js'](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/cli-execution-example.png)

Caso hajam erros no agente, isso será informado nesse momento, na sua CLI. Problemas de conexão e afins podem ocorrer de acordo com o seu setup (caso você tenha problema na conexão com a internet ou o Net Adapter não esteja conectado). Para problemas mais gerais que podem ocorrer por conta de alguma biblioteca ou coisas relativas ao agente, deixarei uma sessão de *"resolução de problemas"* no fim desse guia.

### 3 - Recebimento de emails:

O recebimento de emails se dá ao serem coletados os status dos botões do nobreak no IP dedicado do Net Adapter II. É salvo um log em formato .json na pasta do agente, dentro da subpasta *'output'*. Após esse log ser salvo, o agente decidirá se é válido o disparo de email ou não.

O agente dispara emails em 3 situações apenas:
- **Nobreak com oscilação (com a rede fora, em teste e afins):** Nesse caso, um email será enviado com uma bandeira de "Alerta VERMELHO" no assunto, com as seguintes informações:

<p align="center">
  <img src="https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/error-email-example.png" alt="Exemplo de email de erro"/>
</p>

- **Nobreak retornando à operação normal, logo após oscilação (com a rede ok, sem estar em teste e afins):** Nesse caso, um email será enviado com uma bandeira de "Alerta VERDE" no assunto, com as seguintes informações:

<p align="center">
  <img src="https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/success-email-example.png" alt="Exemplo de email de sucesso"/>
</p>

Caso o Nobreak retorne um ok em outras situações, o normal é que envios de email não sejam enviados, ou seja, se um sucesso for retornado pelo agente, e depois mais um sucesso, nada ocorrerá nos emails. O email de sucesso apenas se dá, quando antes dele houve um erro (também reportado no email).

- **Nobreak com oscilação (com a rede fora, em teste e afins), porém após já ter sido reportado um email anterior, e 30 minutos ou mais tiverem se passado:** O agente, tem uma "medida anti-flood", que evita que você receba muitos emails num intervalo curto, até para não gastar o limite de envios SMTP (caso o provedor que utilize possua um). O agente apenas autorizará um envio de email de erro, após um anterior já ter sido enviado, caso algum dos botões tenha mudado (exemplo: no email de erro anteriormente recebido, o Nobreak estava em teste, mas depois de nova checagem, continuou com erro porém não mais em teste), ou caso 30 minutos ou mais tenham se passado desde o último envio. Nesse caso, um email será enviado com uma bandeira de "Alerta VERMELHO" no assunto, com as informações no mesmo formato de erro mencionado acima, porém com um texto indicativo de que é um lembrete após passarem-se 30 minutos desde o último envio de mail.

<p align="center">
  <img src="https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/error-email-example-30-minutes.png" alt="Exemplo de email de erro após 30 minutos"/>
</p>

>*Em qualquer situação, dentre as relatadas acima, o arquivo .json de log é enviado como anexo no email, para que você possa consultar EXATAMENTE como estavam as informações quando o agente consultou a página do Net Adapter II.*

### 4 - Ferramentas opcionais:

**- 4.1 Automatização de execução do agente:** 

Para o meu setup, conforme já mencionado, foi utilizado um Raspberry Pi4, utilizando uma build Arc do Windows 10. Por esse raspberry Pi eu faço o acesso remoto à diversas coisas de meu setup, e posso monitorá-las, dentre elas, o agente deste repositório.

Pensando nisso, eu desenvolvi um script .bat (executa com o CMD do Windows), que navega até a pasta do agente, e executa o código para que a captura de status seja realizada, os emails sejam enviados e etc.

Esse script está localizado na subpasta *"resources"* do agente. Conforme eu recomendei anteriormente, se você pretende utilizar também um windows no seu setup, para capturar os status do nobreak, faça a criação de uma pasta chamada *"node"*, dentro da raíz de seu disco "C:", e dentro dela você pode colar a pasta inteira do agente. Você pode usar essa pasta para outras finalidades também sem problema, desde que dentro dela esteja a pasta do agente.

Quanto ao script .bat em si, a localização dele não tem tanta importância. Nos meus testes, eu deixei-o dentro da minha pasta de Documentos *("C:\Users\<meu_usuário>\Documents")*. O script também salva um log operacional, para salvar a saída de texto da execução do agente, de maneira que você possa acompanhar posteriormente. Há ainda um controle, para que ele mantenha apenas os 10 logs mais recentes no disco, assim não será ocupado espaço atoa, de logs muito antigos.

![Exemplo de pasta de log operacional do script](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/operational-log-folder.png)

>*No exemplo da imagem acima, você pode ter uma ideia de como ficará a subpasta 'operational_logs' dentro da pasta do agente, que conterá todos os últimos 10 logs operacionais obtidos após a execução do script .bat*.

Tendo tudo isso em funcionamento, sempre que você quiser monitorar, bastará executar o .bat diretamente da pasta onde você deixou-o, e pronto! Todo o processo é automatizado. Caso você não deseje usar o .bat, você terá que navegar até a pasta do agente *("sms-nobreak-home-outage-notification")* e executar o comando *"node index.js"* de dentro dela, por meio da sua CLI de preferência. No próximo tópico, eu explorarei o tema do agendamento da execução do script, para que você automatize a monitoração sem precisar manualmente ter que abrir nenhum script, ou executar nenhum comando.

**- 4.2 Agendamento (compatível com Windows):** 
Em meu setup, eu configurei ainda uma execução agendada do script .bat do tópico anterior, para que assim, mesmo fora de casa, ausente, ou fazendo outras coisas, eu consiga sempre ter controle da situação atual de meu Nobreak. Para isso, eu utilizei aliado ao script .bat acima, o agendador de tarefas do windows. Abaixo, deixarei o passo a passo para configurar o agendamento.
- **4.2.1 Criando a tarefa no Agendador de Tarefas**

    Pesquise "Agendador de Tarefas" no menu iniciar, e navegue até a pasta "Biblioteca do Agendador", então, clique com o botão direito, e então clique em "Criar Nova Tarefa". Você pode preencher os dados da forma sugerida abaixo:
    
    - Aba "Geral":
    ![Configuração Aba "Geral"]()
    - Aba "Disparadores":
        
        - Você precisará cadastrar dois "disparadores", para o primeiro, você usará as configurações a seguir:
        ![Configuração primeiro disparador]()
        
        *OBS: O campo "Iniciar", seguido por uma data não é muito importante, pois a tarefa será repetida a cada 10 minutos. Recomendo colocar a data de hoje, alguns minutos à frente, suficiente pra você terminar de configurar o agendamento, assim, ele iniciará e depois se repetirá sempre de 10 em 10 minutos*
        
        - Para o segundo disparador, as configurações são essas:
        ![Configuração segundo disparador]()
        
        *OBS: Esse segundo disparador, é para caso o servidor (no meu setup o Raspberry Pi4) reinicie ou ligue novamente após um desligamento, o agendamento seja retomado e a tarefa volte a ser executada. Apenas com o primeiro gatilho isso não seria possível, e você teria que manualmente recolocar o agendamento pra rodar. Assim como no disparador anterior, aqui, na data que consta após a caixa marcada "Ativar", também não há grande importância, e você pode colocar uma data alguns minutos a frente da data de hoje, para poder dar tempo de finalizar as configurações do agendamento.*
  
        - Ao fim da configuração dos dois disparadores, você terá a Aba "Disparadores" parecida com a abaixo:
        ![Configuração Aba "Disparadores"]()
    - Aba "Ações":
        - Nessa aba, configuraremos as ações que nosso agendamento fará. Nesse caso, executaremos o nosso script .bat acima explicado. Para isso, você precisará clicar em "Novo", e então marcar a Ação "Iniciar um programa". Na seção de configurações da tela, em "Programa/script", você selecionará o seu cli de preferência. No meu caso, eu usei o cmd nativo do windows, então o endereço é *C:\Windows\System32\cmd.exe*, na opção "Adicione argumentos (opcional)", você precisará acrescentar a operação '/c <"caminho do script bat">', caso você tenha seguido as sugestões de onde deixar cada pasta / arquivo, o texto a colocar seria */c "C:\Users\SEU-USUARIO\Documents\Monitor SMS Nobreak.bat"*. Conforme imagem abaixo:
        ![Configuração específica da aba "Ações"](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/action-detail-configs.png)
    
    Ao fim do processo, a aba "Ações" ficará mais ou menos como abaixo:
    
    ![Configuração Aba "Ações"](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/scheduling-actions-tab.png)
    - Aba "Condições":
    ![Configuração Aba "Condições"](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/scheduling-conditions-tab.png)
    >Importante deixar as configurações exatamente como na imagem, para evitar problemas.
    - Aba "Configurações"
    ![Configuração Aba "Configurações"]()
    >Importante deixar as configurações exatamente como na imagem, para evitar problemas.

    
>*Conforme deixei no título do tópico, esta parte do guia é exclusivamente compatível com Windows. Caso você utilize um linux ou mac, terá que achar uma alternativa similar de agendamento de execução de processos. No caso do Windows, o Agendador de Tarefas faz isso perfeitamente*

