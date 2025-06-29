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
>Você pode encontrar informações sobre os dois primeiros produtos acima no [site oficial da SMS](www.sms.com.br/), assim como pode comprpa-los em seus revendedores no Brasil (pesquisando na Kabum, MercadoLivre, Amazon e afins)

>Aqui eu quero lembrar, que posteriormente, eu acabei realizando um upgrade, onde migrei do Raspberry Pi4 para um Mini PC GMKTec G5. Veja a subseção "Upgrade de equipamento" na seção Utilidades ao fim deste guia.

Uma vez que você os tenha em seu setup e esteja tudo funcionando, você vai precisar ter obviamente também possuir conexão de internet, e algum dispositivo capaz de executar Node.js. No meu caso, utilizei um servidor dedicado, mais especificamente um raspberry pi4, com windows arc instalado. É um tanto lento, mas serve à finalidade proposta. Caso deseje utilizar distros linux ou até MAC, contanto que possua o Node.js instalado, funcionará, já que o Net Adapter e o Nobreak se baseiam unicamente na comunicação entre eles, e não em um SO específico e afins. Se até mesmo quiser rodar através de um aparelho portátil, é possível, desde que consiga rodar o Node.js por ele.

**- 1.2 Node.js:**

A codificação do agente foi toda feita baseada na versão 22.16.0 do node + 10.9.2 do npm. Porém testei com versões anteriores, e funcionou sem maiores problemas. Tente manter o node instalado na máquina de onde executará o agente entre a versão 20 e a 22 e deverá funcionar tudo ok!

### 2 - Baixando e configurando o Agente:
As releases no projeto, são em essência equivalentes a gerar um .zip do repositório, com a diferença que nela haverão já pré-preenchidos o arquivo .env, e haverá a pasta *'operational_logs'* (essa pasta serve para finalidade de automação via Agendador de Tarefas, que trataremos mais a frente neste guia.) criada. O .zip já te dará praticamente tudo o que você necessitará para que o agente funcione. Precisará apenas configurar alguns pontos, conforme faremos abaixo nos próximos passos. :)

**- 2.1 Baixando os arquivos:** 
- Navegue até o [repositório do projeto](https://github.com/chocolover80/sms-nobreak-home-outage-notification), clique em "<> Code", e escolha baixar o .zip. Conforme abaixo:
![Prévia da instrução de download do código do Agente](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/repo-download-instructions.png) 
- Extraia os arquivos para uma pasta de confiança (se estiver utilizando o windows, recomendo criar uma pasta chamada 'node', dentro da raíz do seu disco 'C:', e então dentro dessa pasta, extrair o .zip baixado).

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

*Caso você tenha optado por utilizar o serviço de SMTP do gmail, conforme sugerido, recomendo que você crie uma senha de app nas configurações da sua conta, para uso exclusivo do SMTP, assim, você não precisará utilizar sua senha comum e deixá-la à mostra no arquivo .env, sendo que ela será usada para outras finalidades. Para fazer isso, você pode seguir [esse guia](https://www.youtube.com/watch?v=nFbZLX2U-5k). Caso algum link no vídeo não esteja funcionando, ou apareça diferente pra você, use este [guia oficial da Google](https://support.google.com/accounts/answer/185833?hl=pt-BR), lá tem todos os links necessários e o passo a passo. Após conseguir gerar sua sua senha de app, você pode configurá-la no arquivo .env, conforme indicado acima*

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

Pensando nisso, eu utilizei um comando Powershell (executa com o powershell.exe do Windows), que navega até a pasta do agente, e executa o código para que a captura de status seja realizada, os emails sejam enviados e etc.

Esse comando está localizado na subpasta *"resources"* do agente, no arquivo *"Automate Agent Execution PowerShell Command.txt"*, você pode copiar o comando dentro do arquivo e colar no seu Powershell. Conforme eu recomendei anteriormente, se você pretende utilizar também um windows no seu setup, para capturar os status do nobreak, faça a criação de uma pasta chamada *"node"*, dentro da raíz de seu disco "C:", e dentro dela você pode colar a pasta inteira do agente. Você pode usar essa pasta para outras finalidades também sem problema, desde que dentro dela esteja a pasta do agente.

Quanto ao comando em si, a localização de onde você o executa não tem tanta importância. Nos meus testes, eu executei-o dentro da minha pasta de Documentos e *("C:\Users\<meu_usuário>\Documents")* e diversas outras, e funcionou sem problemas. O comando também emite um log operacional, para salvar a saída de texto da execução do agente, de maneira que você possa acompanhar posteriormente.

Há ainda outro comando, que faz um controle, para que mantenham-se apenas os 10 logs mais recentes no disco, assim não será ocupado espaço atoa, com logs muito antigos. Este comando pode ser localizado na subpasta *"resources"* do agente, no arquivo *"Automate Old-Log Deletion PowerShell Command.txt"*, você pode copiar o comando dentro do arquivo e colar no seu Powershell. 

![Exemplo de pasta de log operacional do script](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/operational-log-folder.png)

>*No exemplo da imagem acima, você pode ter uma ideia de como ficará a subpasta 'operational_logs' dentro da pasta do agente, que conterá todos os últimos 10 logs operacionais obtidos após a execução do script powershell*.

Tendo tudo isso em funcionamento, sempre que você quiser monitorar, bastará executar o comando diretamente do seu Powershell, e pronto! Todo o processo é automatizado. Caso você não deseje usar o .comando via Powershell, você terá que navegar até a pasta do agente *("sms-nobreak-home-outage-notification")* e executar o comando *"node index.js"* de dentro dela, por meio da sua CLI de preferência. No próximo tópico, eu explorarei o tema do agendamento da execução do script, para que você automatize a monitoração sem precisar manualmente ter que abrir nenhum script, ou executar nenhum comando.

**- 4.2 Agendamento (compatível com Windows):** 
Em meu setup, eu configurei ainda uma execução agendada do comando Powershell do tópico anterior, para que assim, mesmo fora de casa, ausente, ou fazendo outras coisas, eu consiga sempre ter controle da situação atual de meu Nobreak. Para isso, eu utilizei aliado ao comando acima, o agendador de tarefas do windows. Abaixo, deixarei o passo a passo para configurar o agendamento.
- **4.2.1 Criando as tarefas no Agendador de Tarefas**

    Pesquise "Agendador de Tarefas" no menu iniciar, e navegue até a pasta "Biblioteca do Agendador", então, clique com o botão direito, e então clique em "Criar Nova Tarefa". Você pode preencher os dados da forma sugerida abaixo:
    
    >Aqui é importante salientar que: caso você queira optar por fazer as rotinas de automação abaixo, precisará criar uma pasta chamada "operational_logs" dentro da pasta do seu agente (caso tenha seguido a sugestão de caminho que recomendamos, será então em *"C:\node\sms-nobreak-home-outage-notification\"*)

    >**4.2.1.1 Automação de execução do agente** 
    - Aba "Geral":
    ![Configuração Aba "Geral" (automação do agente)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/scheduling-general-tab.png)
    >Importante deixar as configurações exatamente como na imagem, para evitar problemas.
    - Aba "Disparadores":
        
        - Você precisará cadastrar dois "disparadores", para o primeiro, você usará as configurações a seguir:
        ![Configuração primeiro disparador (automação do agente)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/first-trigger-configs.png)
        
        *OBS: O campo "Iniciar", seguido por uma data não é muito importante, pois a tarefa será repetida a cada 10 minutos. Recomendo colocar a data de hoje, alguns minutos à frente, suficiente pra você terminar de configurar o agendamento, assim, ele iniciará e depois se repetirá sempre de 10 em 10 minutos.*
        
        *OBS 2: É importante preencher o campo de "Interromper tarefa executada por mais de com o valor que te atender. Por padrão, ele lista apenas alguns valores, mas você pode digitar (desde que no formato correto), como no exemplo da imagem, onde eu coloco '8 minutos'. É bacana colocar esse tempo limite, pois caso a aplicação trave em algum ponto, não vai ficar num eterno loop. Vai encerrar e tentar de novo no tempo que você agendou.*        
        
        - Para o segundo disparador, as configurações são essas:
        ![Configuração segundo disparador (automação do agente)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/second-trigger-configs.png)
        
        *OBS: Esse segundo disparador, é para caso o servidor (no meu setup o Raspberry Pi4) reinicie ou ligue novamente após um desligamento, o agendamento seja retomado e a tarefa volte a ser executada. Apenas com o primeiro gatilho isso não seria possível, e você teria que manualmente recolocar o agendamento pra rodar. Assim como no disparador anterior, aqui, na data que consta após a caixa marcada "Ativar", também não há grande importância, e você pode colocar uma data alguns minutos a frente da data de hoje, para poder dar tempo de finalizar as configurações do agendamento.*

        *OBS 2: É importante preencher o campo de "Interromper tarefa executada por mais de com o valor que te atender. Por padrão, ele lista apenas alguns valores, mas você pode digitar (desde que no formato correto), como no exemplo da imagem, onde eu coloco '8 minutos'. É bacana colocar esse tempo limite, pois caso a aplicação trave em algum ponto, não vai ficar num eterno loop. Vai encerrar e tentar de novo no tempo que você agendou.* 
  
        - Ao fim da configuração dos dois disparadores, você terá a Aba "Disparadores" parecida com a abaixo:
        ![Configuração Aba "Disparadores"](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/scheduling-triggers-tab.png)
    - Aba "Ações":
        - Nessa aba, configuraremos as ações que nosso agendamento fará. Nesse caso, executaremos o nosso comando powershell acima explicado. Para isso, você precisará clicar em "Novo", e então marcar a Ação "Iniciar um programa". Na seção de configurações da tela, em "Programa/script", você selecionará o powershell, então o texto a ser inserido é *powershell.exe*, na opção "Adicione argumentos (opcional)", você precisará acrescentar a operação >>-NoProfile -Command "Write-Host 'Iniciando varredura do Nobreak...' -ForegroundColor Cyan; cd '[CAMINHO ONDE INSTALOU O AGENTE AQUI]'; node index.js | Out-File -FilePath ('[CAMINHO ONDE INSTALOU O AGENTE AQUI]\operational_logs\operational_log_{0:dd-MM-yyyy_HH-mm-ss}.txt' -f (Get-Date)); Write-Host 'Varredura concluída.' -ForegroundColor Green"<<, caso você tenha seguido as sugestões de onde deixar cada pasta / arquivo, o texto a colocar no lugar do que está dentro dos colchetes (e removendo os colchetes claro) seria *'C:\node\sms-nobreak-home-outage-notification'*. Conforme imagem abaixo:
        ![Configuração específica da aba "Ações" (automação do agente)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/action-detail-configs.png)
    
    Ao fim do processo, a aba "Ações" ficará mais ou menos como abaixo:
    
    ![Configuração Aba "Ações" (automação do agente)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/scheduling-actions-tab.png)
    - Aba "Condições":
    ![Configuração Aba "Condições" (automação do agente)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/scheduling-conditions-tab.png)
    >Importante deixar as configurações exatamente como na imagem, para evitar problemas.
    - Aba "Configurações"
    ![Configuração Aba "Configurações" (automação do agente)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/scheduling-configurations-tab.png)
    >Importante deixar as configurações exatamente como na imagem, para evitar problemas.

    >**4.2.1.2 Automação de limpeza de logs obsoletos** 
    - Aba "Geral":
    ![Configuração Aba "Geral" (automação limpeza logs)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/scheduling-log_cleaner-general-tab.png)
    >Importante deixar as configurações exatamente como na imagem, para evitar problemas.
    - Aba "Disparadores":
        
        - Você precisará cadastrar dois "disparadores", para o primeiro, você usará as configurações a seguir:
        ![Configuração primeiro disparador (automação limpeza logs)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/log_cleaner-first-trigger-configs.png)
        
        *OBS: Recomendo colocar um horário interessante que não conflite com a rotina anterior, de automação do agente, no caso, eu configurei pra rodar sempre a cada 10 minutos, em horário redondo, ou seja: 08:00 - 08:10 - 08:20 e assim sucessivamente... Se você colocar a rotina de limpeza em horários redondos também, pode acabar conflitando o processo de escrita de arquivos no disco, no meu caso, eu configurei para rodar num dia específico, às 23:55, assim, não conflita com o horário redondo de automação do agente das 23:50, nem de 00:00. E após isso, ele se repetirá todo dia nesse mesmo horário.*   
        
        - Para o segundo disparador, as configurações são essas:
        ![Configuração segundo disparador (automação limpeza logs)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/log_cleaner-second-trigger-configs.png)
        
        *OBS: Esse segundo disparador, é para caso o servidor (no meu setup o Raspberry Pi4) reinicie ou ligue novamente após um desligamento, o agendamento seja retomado e a tarefa volte a ser executada. Apenas com o primeiro gatilho isso não seria possível, e você teria que manualmente recolocar o agendamento pra rodar.*
  
        - Ao fim da configuração dos dois disparadores, você terá a Aba "Disparadores" parecida com a abaixo:
        ![Configuração Aba "Disparadores" (automação limpeza logs)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/scheduling-log_cleaner-triggers-tab.png)
    - Aba "Ações":
        - Nessa aba, configuraremos as ações que nosso agendamento fará. Nesse caso, executaremos o nosso comando powershell acima explicado. Para isso, você precisará clicar em "Novo", e então marcar a Ação "Iniciar um programa". Na seção de configurações da tela, em "Programa/script", você selecionará o powershell, então o texto a ser inserido é *powershell.exe*, na opção "Adicione argumentos (opcional)", você precisará acrescentar a operação >>-NoProfile -Command "Write-Host 'Iniciando limpeza de logs obsoletos...' -ForegroundColor Yellow; Get-ChildItem '[CAMINHO DOS SEUS LOGS OPERACIONAIS AQUI]' -Filter 'operational_log_*.txt' | Sort-Object LastWriteTime -Descending | Select-Object -Skip 10 | Remove-Item -Force; Write-Host 'Limpeza concluída. Os 10 últimos logs seguem na pasta!' -ForegroundColor Green"<<, caso você tenha seguido as sugestões de onde deixar cada pasta / arquivo, o texto a colocar no lugar do que está dentro dos colchetes (e removendo os colchetes claro) seria *'C:\node\sms-nobreak-home-outage-notification/operational_logs'*. Conforme imagem abaixo:
        ![Configuração específica da aba "Ações" (automação limpeza logs)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/action-log_cleaner-detail-configs.png)
    
    Ao fim do processo, a aba "Ações" ficará mais ou menos como abaixo:
    
    ![Configuração Aba "Ações" (automação limpeza logs)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/scheduling-log_cleaner-actions-tab.png)
    - Aba "Condições":
    ![Configuração Aba "Condições" (automação limpeza logs)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/scheduling-log_cleaner-conditions-tab.png)
    >Importante deixar as configurações exatamente como na imagem, para evitar problemas.
    - Aba "Configurações"
    ![Configuração Aba "Configurações" (automação limpeza logs)](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/scheduling-log_cleaner-configurations-tab.png)
    >Importante deixar as configurações exatamente como na imagem, para evitar problemas.

    
>*Conforme deixei no título do tópico, esta parte do guia é exclusivamente compatível com Windows. Caso você utilize um linux ou mac, terá que achar uma alternativa similar de agendamento de execução de processos. No caso do Windows, o Agendador de Tarefas faz isso perfeitamente*

### 5 - Resolução de problemas:
Idealmente, erros que aconteçam durante o processo poderão ser filtrados nos arquivos de log, e não deverão acarreetar em coisas maiores acerca da funcionalidade do agente. Porém, existem alguns erros em particular, que eu percebi que pode ocorrer em algumas máquinas mais frequentemente.

*Verifique sempre os logs (tanto os da subpasta 'output' dentro da pasta do agente, quanto os da subpasta 'operational_logs" dentro da pasta do agente).* 

**- 5.1 Erros na inicialização do agente, por conta de navegador:**

Caso você encontre erro específico do puppeteer, que é a biblioteca node.js usada para fazer operações in-browser (baseado em chrome), reclamando de que não foi possível encontrar uma versão específica do chrome, isso se deve ao fato de que o puppeteer, instala "in-bundle" uma versão específica compactada do google chrome para poder processar as operações. O normal, é que quando você execute o comando "npm install" no início deste guia, na seção *"Setup do Agente > 2 - Baixando e configurando o Agente > 2.2 Instalando as dependências do agente:"*, isso já seja suprido. porém, podem haver casos onde isso não seja feito automaticamente.

Caso isso ocorra, você poderá fazer a instalação manual do google chrome in-bundle do puppeteer da seguinte forma:

- Navegue até a pasta *"node_modules"* dentro da pasta do agente, depois navegue até a pasta *"puppeteer"*, de dentro dessa pasta, por meio do seu CLI de preferência, execute o comando *"node install.mjs"*. Aguarde a finalização do projeto, e pronto! Agora o chrome in-bundle, necessário para que o puppeteer consiga processar instruções no navegador já estará funcionando corretamente.

**- 5.2 Erros relacionados ao envio de email:**

Se em algum ponto você receber algum erro de *"connection refused"* ou *"timeout"* durante o processo de envio de email, há grandes chances disso ter acontecido por conta de má configuração das informações de SMTP no seu arquivo .env, portanto verifique-o de ponta a ponta.

Além de problemas de informação do arquivo .env, certifique-se de que não esteja rodando o script numa rede protegida, ou caso sim, crie excessões de firewall e porta em seu roteador, pois se por alguma razão serviços de SMTP forem bloqueados pela sua rede, não vai funcionar de maneira nenhuma a notificação por email.

### 6 - Utilidades:

**- 6.1 Upgrade de equipamento:**

Durante os meus testes, e algumas semanas depois fazendo outras tarefas, eu percebi o que já era inevitável. O Raspberry Pi4 é muito fraco pra alguns tipos de função, principalmente rodar um windows 10. Existem limitações de arquitetura, BUG's que são simplesmente impossíveis de resolver. Então em geral, você vai conseguir trabalhar com ele, mas vai ser sempre uma luta. Vai passar por lentidão, os BUG's já citados, vai ter problema no relógio (como eu tive), e você não vai conseguir sincronizar a hora direito. Enfim... é uma luta que ficou cansativa.

Com isso, eu optei por fazer um upgrade de equipamento, onde eu substitui o Raspberry Pi4 por um Mini PC GMKTec G5, um Computador mega pequeno (até menor em tamanho que o Pi4), e com um grande poder de processamento se comparado ao Pi4. Dá até pra rodar outras coisas como retrogaming, e até alguns jogos mais leves (Hades, Deadcells e afins), então é um excelente aliado nessa aplicação. Com ele, não haverá nenhum desses problemas acima citados no Pi4, e além disso, ele ainda vem com uma licença Windows 11 Pro. Ou seja: é uma licença oficial, de uma versão atual do Windows, que terá suporte, segurança e afins. Ou seja, foi apenas vitória escolher fazer esse upgrade. Você consegue encontrar ele para comprar no Brasil entre 1500 a 2000 reais, ou pode importar no AliExpress (tenha em mente as taxações).

Aqui, eu deixo o [site oficial da GMKTec](https://www.gmktec.com) - Você pode inclusive comprar direto pelo site deles, mas tenha em mente os impostos de importação, e a limitação que pode haver para envios até o Brasil - bem como a [página de suporte oficial da GMKTec](https://www.gmktec.com/pages/drivers-and-software?srsltid=AfmBOooI7fx1T7VpmnSbbAE1OOIikWRk0LoQl8_EVlZqTSWuVN8r5-Ho), onde dentre os itens da tabela, você pode achar os arquivos necessários para o Modelo Nukbox G5, tanto a instalação do windows customizada específica para o equipamento (caso você precise formatar) e os drivers em si.

**- 6.2 Mudanças pós o upgrade:**

Em suma, o agente funciona da mesma forma, e você poderia até mesmo manter as mesmíssimas configurações dos tópicos anteriores. Mas como eu testei, e vi que ele responde bem mais rápido, de modo muito mais fluido, eu optei por "cortar na metade" os timings de antes. Ou seja, eu alterei as tarefas agendadas, para a metade do tempo anterior, isto é, o agente checaria de 10 em 10 minutos, e encerraria a tarefa, caso ela deixasse de responder, em 8 minutos.

O que eu fiz foi colocar ele para rodar de 5 em 5 minutos, e encerrar caso não responda em até 4. Em nenhum teste que eu fiz, chegou a demorar 1 minuto ou mais. Sempre respondeu entre 10 a no máximo 30 segundos, portanto é uma margem mega segura. 10 minutos já atendia, mas de 5 em 5 fica ainda melhor pra mim, pois assim eu garanto que caso falte energia, o Nobreak ficará apenas 5 minutos "fora do meu controle", ou seja, se faltar energia 12:00, 12:05 eu já vou ser avisado, e poder tomar providências. 

Claro que idealmente o Nobreak não deveria durar apenas 10 minutos ligado, mas dependendo do tanto de coisas que você coloque pra ligar nele, pode ser que a bateria fique mais comprometida, então 5 minutos é realmente uma margem bem segura... afinal, se o seu nobreak não aguenta nem 5 minutos ligado, é hora de levar o bichinho pra uma manutenção, não é mesmo? hahaha. 

Além disso, eu também alterei a tarefa de limpeza de logs, para passar a rodar todo dia às 23:59, e não mais às 23:55, eu fiz isso apenas para evitar que múltiplas tarefas agendadas executem no mesmo momento (isso não é um problema, é mais uma questão de boa prática mesmo, fiz testes com as duas rodando ao mesmo tempo, e não houve qualquer problema, mas preferi evitar), então antes, era sempre a cada 10 minutos redondo, por exemplo: 12:00, depois 12:10, depois 12:20 e assim sucessivamente. Agora, seria 12:00, depois 12:05, depois 12:10 e assim sucessivamente. Então se tivesse mantido a limpeza para 23:55 todo dia, eventualmente às 23:55 iriam ser desparadas as duas tarefas. Nos testes que fiz, a limpeza também não demorou mais que 10 segundos pra terminar, isso mesmo com a pasta cheia de logs, então ficou perfeito dessa forma, sem tarefas executando na mesma hora, e com as boas práticas em dia! :)

Bem, dito tudo isso, abaixo deixo as telas das tarefas agendadas com as alterações que eu fiz.

**6.2.1. Alteração na automação de execução do agente:**

A alteração será apenas nos gatilhos, então, na configuração da tarefa agendada "Monitorar Nobreak SMS", você entrará no primeiro Gatilho ("Uma vez") e configurar conforme abaixo: 


![Alteração no gatilho 1 da tarefa de monitoramento](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/post-upgrade-trigger1-agent-monitoring.png) 

Agora, você entrará no segundo Gatilho ("Ao fazer logon") e configurar conforme abaixo
![Alteração no gatilho 2 da tarefa de monitoramento](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/post-upgrade-trigger2-agent-monitoring.png) 

***Lembrando que aqui valem as mesmas observações anteriores, a parte de "Iniciar" no gatilho 1, ou "Ativar" no gatilho 2 não tem tanta importância, o que importa é mais como você vai configurar os outros campos, ou seja, repetir "Indefinidamente" e ser de 5 em 5 minutos no gatilho 1, e interromper se tiver rodando por mais de 4 minutos em ambos os gatilhos.*

**6.2.2. Alteração na automação de limpeza de logs obsoletos:**

A alteração será apenas nos gatilhos, então, na configuração da tarefa agendada "Limpar logs obsoletos do Nobreak SMS", você entrará no primeiro Gatilho ("Diariamente") e configurar conforme abaixo: 
![Alteração no gatilho 1 da tarefa de limpeza de logs](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/post-upgrade-trigger1-log-cleaning.png) 

Agora, você entrará no segundo Gatilho ("Ao fazer logon") e configurar conforme abaixo:
![Alteração no gatilho 2 da tarefa de limpeza de logs](https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/post-upgrade-trigger2-log-cleaning.png) 
***Lembrando que aqui valem as mesmas observações anteriores, a parte de "Ativar" no gatilho 2 não tem tanta importância, o que importa é mais como você vai configurar os outros campos em ambos os gatilhos.*

>Após ter feito isso, tudo esterá ainda mais ideal. Conforme expliquei, isso não é algo absolutamente necessário, e pode variar de acordo com a sua preferência. Eu recomendo fortemente, mas não sinta-se no dever de fazer tudo 100% como eu fiz. Espero ter ajudado! :)

# Conclusão
Bem, acredito que isso seja tudo. A princípio, o agente é extremamente simples, e não tem codificação complexa ou funcionalidades muito elaboradas. Foi tudo feito com puro webscrapping e as regras de negócio foram bem simples e atenderam muito bem minha necessidade. Mas de dev pra dev, a magia do opensource é poder colaborar entre si, então sintam-se à vontade para utilizar o projeto para qualquer finalidade (desde que não remunerada é claro), e até propor melhorias, sugestões e críticas. Qualquer dúvida que não esteja suprida na documentação, sinta-se a vontade para me contatar. Deixo meus detalhes de contato na página do perfil aqui no GitHub. Espero que seja útil, e até a próxima!

E lembrem-se sempre: *"Não há lugar como 127.0.0.1"*

Com carinho,

chocolover80 (E. D. Norton)

<p align="left">
  <img src="https://raw.githubusercontent.com/chocolover80/sms-nobreak-home-outage-notification/refs/heads/main/docs/imgs/author%20signature.jpeg" width="200" height="200" alt="chocolover80's signature img"/>
</p>
