# Task Manager

O "Task Manager" é uma aplicação de gerenciamento de tarefas que permita aos usuários organizar, monitorar e concluir suas atividades diárias, acadêmicas ou profissionais de maneira eficiente. Sendo um projeto de cunho estritamente acadêmico, o sistema tem como propósito servir como um laboratório prático para o estudo aprofundado do desenvolvimento de aplicações web full stack.

A escolha de um gerenciador de tarefas justifica-se por ser um domínio de problema perfeitamente dimensionado: ele engloba todos os desafios fundamentais da engenharia de software contemporânea, incluindo operações de CRUD complexas, gerenciamento de estado da interface, autenticação, persistência de dados, e design de API, sem a sobrecarga de regras de negócios obscuras de indústrias específicas.

> Este projeto foi generado utilizando o [Angular CLI v19.2.23](https://github.com/angular/angular-cli).

## Task Manager - Diretórios Back-End

| **Tecnologia** | **Link** |        **Descrição**       |
| -------------- | ---------------- |--------------------------- |
| ![Nodejs com Express TS e Prisma ORM](https://skills.syvixor.com/api/icons?i=expressjs&theme=dark) | [Diretório Github](https://github.com/AdrianoBispo/task-manager-nodejs-expressTS) | Neste diretório contém a versão desenvolvida utilizando o runtime Nodejs com o Express, Typescript e Prisma ORM. |
| ![NestJS](https://skills.syvixor.com/api/icons?i=nestjs&theme=dark) | [Diretório Github](https://github.com/AdrianoBispo/task-manager-nodejs-nestjs) | Neste diretório contém a versão desenvolvida utilizando o runtime Nodejs, NestJS com Prisma ORM. |

## Servidor de desenvolvimento

Para iniciar um servidor local de desenvolvimento, execute:

```bash
ng serve
```

Depois que o servidor estiver em execução, abra o navegador e acesse `http://localhost:4200/`. A aplicação será recarregada automaticamente sempre que você modificar qualquer arquivo-fonte.

## Geração de código (scaffolding)

O Angular CLI inclui ferramentas poderosas de scaffolding. Para gerar um novo componente, execute:

```bash
ng generate component nome-do-componente
```

Para uma lista completa dos esquemas disponíveis (como `components`, `directives` ou `pipes`), execute:

```bash
ng generate --help
```

## Build

Para compilar o projeto, execute:

```bash
ng build
```

Isso irá compilar o projeto e armazenar os artefatos de build no diretório `dist/`. Por padrão, o build de produção otimiza a aplicação para desempenho e velocidade.

## Executando testes unitários

Para executar testes unitários com o test runner [Karma](https://karma-runner.github.io), use o seguinte comando:

```bash
ng test
```

## Executando testes de ponta a ponta (e2e)

Para testes end-to-end (e2e), execute:

```bash
ng e2e
```

O Angular CLI não vem com um framework de testes end-to-end por padrão. Você pode escolher o que melhor atender às suas necessidades.

## Recursos adicionais

Para mais informações sobre o uso do Angular CLI, incluindo referências detalhadas de comandos, visite a página [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli).
