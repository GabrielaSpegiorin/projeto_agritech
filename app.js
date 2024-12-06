const express = require('express');
const session = require('express-session');
const path = require('path');
const fileUpload = require("express-fileupload");
require('dotenv').config();

const app = express()
//Configurações do Servidor
app.set('views', path.join(__dirname, 'views')); // Configura o diretório das views
app.set('view engine', 'ejs') //Configura o motor de templates para EJS
app.use(express.static(path.join(__dirname, 'public'))); //Define pasta para arquivos
//css / img
app.use(express.urlencoded({ extended: true })) //Para processar os dados do formulário
app.use(express.json()); // utilizar dados em formato JSON
app.use(session({
    secret: 'sesisenai', // Um segredo para assinar a sessão
    resave: false, // Não salva a sessão se não houver modificações
    saveUninitialized: false // Não salva uma sessão vazia
}));
app.use(fileUpload()) 


// Middleware para verificar se o usuário está logado
// e disponibilizar a sessão em todas as views
const verificarAutenticacao = (req, res, next) => {
    if (req.session.usuarioLogado) {
        res.locals.usuarioLogado = req.session.usuarioLogado || null;
        res.locals.nomeUsuario = req.session.nomeUsuario || null;
        res.locals.idUsuario = req.session.idUsuario || null;
        next(); // Usuário está logado, pode continuar
    } else {
        res.redirect('/auth/login'); // Redireciona para a página de login
    }
}

//Rota da página principal "Landing Page"
app.get('/', (req, res) => {
    //   views/landing/index.ejs
    res.render('landing/index')
})


//Utilizando Rotas Admin
const adminRotas = require('./routes/admin')
app.use('/admin', verificarAutenticacao, adminRotas)

//Utilizando Rotas Login
const loginRotas = require('./routes/loginRotas')
app.use('/auth', loginRotas)

//Utilizando Rotas de Categorias
const categoriasRotas = require('./routes/categoriasRotas')
app.use('/categorias', verificarAutenticacao, categoriasRotas)

//Utilizando Rotas de Produtos
const produtosRotas = require('./routes/produtosRotas')
app.use('/produtos', verificarAutenticacao, produtosRotas)

//Utilizar rotas usuarios
const usuariosRotas = require('./routes/usuarioRotas')
app.use('/usuario', verificarAutenticacao, usuariosRotas)


// //Utilizando Rotas de Disciplinas
// const disciplinasRotas = require('./routes/disciplinasRotas')
// app.use('/disciplinas', verificarAutenticacao, disciplinasRotas)

const porta = 3000
app.listen(porta, () => {
    console.log(`Servidor rodando na porta http://192.168.0.108:${porta}`)
})



