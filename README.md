
# Fruto de Minas | Gestão de Estoque

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white)
![Status](https://img.shields.io/badge/Status-Protótipo_acadêmico-555?style=for-the-badge)

Sistema web de gestão de estoque e controle de validade de polpas de frutas armazenadas em câmara fria, desenvolvido no contexto do **Desafio SENAI #13100**.

O projeto combina uma interface interativa com regras de controle de estoque por lote, buscando facilitar a identificação de produtos próximos do vencimento, a rastreabilidade das movimentações e a redução de desperdícios.

---

## Visão geral

A proposta é substituir controles manuais dispersos por uma interface centralizada de consulta e registro.

O sistema permite acompanhar o saldo de cada sabor, registrar entradas e saídas e identificar lotes que exigem atenção, proporcionando maior organização e eficiência no controle de estoque.

## Funcionalidades

- **Dashboard interativo:** galeria expansível de sabores, estoque atualizado e iluminação dinâmica conforme a fruta selecionada.
- **Entrada de produtos:** registro de quantidade, data de recebimento e validade por lote, com identificação automática.
- **Saída de produtos:** seleção manual de lote elegível ou sugestão automática pelo método FEFO.
- **Controle de validade:** alertas progressivos, registro de ciência e bloqueio de lotes vencidos para saídas regulares.
- **Descarte:** registro específico de retirada de produtos vencidos.
- **Histórico:** entradas e saídas com data, quantidade e identificação dos lotes movimentados.
- **Persistência local:** armazenamento automático no navegador e atualização entre abas da mesma origem.
- **Interface responsiva:** suporte a dispositivos móveis, navegação por teclado e preferência por movimento reduzido.

## Interface e experiência do usuário

A identidade visual foi desenvolvida com foco na apresentação dos produtos, na clareza das informações e na experiência do operador.

Entre os principais elementos visuais estão:

- Tema escuro com acabamento premium.
- Iluminação ambiente dinâmica.
- Paleta de cores individual para cada sabor.
- Painéis interativos e expansíveis.
- Wallpapers personalizados.
- Degradês e transições suaves.
- Indicadores visuais de estoque e validade.
- Layout responsivo.
- Navegação simplificada.

## Regras de negócio

### FEFO — First Expired, First Out

O método FEFO prioriza os lotes com vencimento mais próximo.

Em caso de empate, o sistema considera a data de recebimento e, posteriormente, o identificador do lote.

Antes de confirmar uma saída, o operador visualiza os lotes sugeridos e suas respectivas quantidades, devendo conferir os produtos físicos.

Lotes vencidos não são elegíveis para saídas regulares. Sua retirada deve ser registrada como descarte.

### Níveis de validade

| Situação | Prazo restante | Comportamento |
| --- | --- | --- |
| Regular | Acima de 10 dias | Sem alerta |
| Preventivo | 6 a 10 dias | Acompanhamento da validade |
| Atenção | 3 a 5 dias | Prioridade de saída |
| Urgente | 0 a 2 dias | Vencimento iminente |
| Vencido | Após a data de validade | Bloqueio de saída regular |

O registro de ciência não elimina o risco nem remove o lote do controle de validade.

Um agravamento do nível de alerta exige nova ciência. Lotes sem saldo deixam de aparecer nos alertas.

## Tecnologias utilizadas

| Tecnologia | Aplicação |
| --- | --- |
| HTML5 | Estrutura semântica e formulários |
| CSS3 | Layout responsivo, degradês, iluminação e animações |
| JavaScript (Vanilla) | Regras de negócio, manipulação do DOM e gerenciamento de estado |
| Web Storage API | Persistência de dados via localStorage |
| GitHub Pages | Hospedagem estática da aplicação |

O projeto utiliza exclusivamente tecnologias web nativas, sem dependência de frameworks, bibliotecas externas ou backend.

## Estrutura do projeto

```text
FrutoDeMinas/
│
├── assets/       # Imagens, ícones e wallpapers das frutas
│
├── index.html    # Estrutura e telas da aplicação
├── style.css     # Identidade visual e responsividade
├── script.js     # Regras de negócio e interatividade
└── README.md     # Documentação do projeto
```

## Acesso à aplicação

O projeto foi desenvolvido para hospedagem estática através do **GitHub Pages**, permitindo acesso diretamente pelo navegador.

Não é necessário instalar dependências, configurar servidores ou realizar processos de compilação.

## Hospedagem

A aplicação utiliza exclusivamente tecnologias web nativas, sendo compatível com a infraestrutura de hospedagem estática do GitHub Pages.

Os registros de estoque são armazenados localmente no navegador através da Web Storage API (`localStorage`).

## Privacidade e armazenamento

O sistema foi desenvolvido para operar localmente, sem depender de serviços externos para o armazenamento dos registros.

- Não solicita dados pessoais.
- Não utiliza cookies próprios de rastreamento.
- Não possui autenticação.
- Não possui banco de dados remoto.
- Não realiza sincronização entre dispositivos.
- Não possui exportação ou restauração manual de backup.

Os registros permanecem armazenados no navegador utilizado. A limpeza dos dados do navegador pode resultar na perda das informações registradas.

## Limitações do projeto

Este sistema é um protótipo acadêmico destinado à demonstração de uma solução tecnológica para controle de estoque e validade.

O projeto não substitui procedimentos sanitários, conferência física, rotulagem ou controles oficiais de estoque.

O catálogo de sabores apresentado possui caráter ilustrativo.

Antes de uma implantação real, é necessário validar o catálogo, os procedimentos operacionais, a segurança e os requisitos legais aplicáveis.

## Possibilidades de evolução

- [ ] Desenvolvimento de backend e API REST.
- [ ] Integração com banco de dados.
- [ ] Autenticação de usuários.
- [ ] Controle de permissões.
- [ ] Sincronização entre dispositivos.
- [ ] Relatórios gerenciais.
- [ ] Indicadores de perdas e desperdícios.
- [ ] Integração com leitores de código de barras.
- [ ] Estratégia de backup e recuperação de dados.

## Contexto acadêmico

Desenvolvido como protótipo para o **Desafio SENAI #13100**, com foco no controle visual de estoque e validade de polpas de frutas.

A proposta busca aplicar conhecimentos de desenvolvimento web na resolução de problemas relacionados à organização, rastreabilidade e prevenção de perdas no ambiente operacional.

O projeto não implica vínculo oficial ou homologação pela empresa citada.

## Autoria

**Denio**

Responsável pelo desenvolvimento e implementação do sistema, incluindo:

- Arquitetura front-end.
- Design de interface.
- Experiência do usuário.
- Regras de negócio.
- Gerenciamento de estado.
- Persistência de dados.
- Responsividade e interatividade.

---

<p align="center">
    <strong>POLPAS DE FRUTAS</strong>
</p>

<p align="center">
    Tecnologia aplicada à gestão de estoque e prevenção de desperdícios.
</p>

