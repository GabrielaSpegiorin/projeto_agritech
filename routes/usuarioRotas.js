const express = require('express')
const router = express.Router()
const BD = require('../db')

//Listar usuários (R - read)
//Para acessar essa rota digito /usuario/
router.get('/', async (req, res) => {
    try {
        const busca = req.query.busca || ''
        const ordenar = req.query.ordenar || 'nome'


        const pg = req.query.pg || 1  //obtendo a pagina de dados - paginação 
        const limite = 10  //numero de registros por pagina
        const offset = (pg - 1) * limite  //quantidade de registros que quero "pular"
        const buscaDados = await BD.query(`SELECT * FROM usuario where upper(nome) like $1
                order by ${ordenar}`, [`%${busca.toUpperCase()}%`])
    
    
        const totalItens = await BD.query(`
                select count(*) as total 
                from usuario
                where upper(usuario.nome) like $1 
                `, [`%${busca.toUpperCase()}%`])
    
        const totalPgs = Math.ceil(totalItens.rows[0].total / limite)
    
        res.render("usuariosTelas/lista", {
            vetorDados: buscaDados.rows,
            busca: busca,
            ordenar: ordenar,
            pgAtual: parseInt(pg),
            totalPgs: totalPgs
        })


    } catch (erro) {
        console.log('Erro ao listar usuario', erro)
        res.render('UsuariosTelas/lista', { mensagem : erro })
    }
})


//Rota para abrir tela para criar um novo usurio (c - Create)
//Para acessar /usuario/novo
router.get('/novo', (req, res) => {
    res.render('UsuariosTelas/criar')
})

router.post('/novo', async (req, res) => {
    const {usuario, nome, senha} = req.body
    await BD.query(`insert into usuario (usuario, nome,senha)
     values ($1, $2, $3)`, [usuario, nome, senha])
    res.redirect('/usuario')
})


//Excluindo um usuario (D - Delete)
router.post('/:id/deletar', async (req, res) => {
    const { id } = req.params
    //const id = req.params.id
    await BD.query('delete from usuario where id_usuario = $1', [id])
    res.redirect('/usuario')
})

//Editar um usuario (U - Update)
router.get('/:id/editar', async (req, res) => {
    const { id } = req.params
    //const { id } = req.params.id
    const resultado = await BD.query('select * from usuario where id_usuario = $1', [id])
    res.render('UsuariosTelas/editar', {usuario: resultado.rows[0] })
})

router.post('/:id/editar', async (req, res) => {
    const { id } = req.params
    const { nome_usuario,usuario,senha } = req.body 
    await BD.query(`update usuario set nome =$1, usuario = $2, senha = $3 where id_usuario = $4`, [nome_usuario, usuario,senha , id])
        res.redirect('/usuario')
})
module.exports = router 