const express = require('express')
const router = express.Router()
const BD = require('../db')

//Listar Categorias (R - read)
//Para acessar essa rota digito /categorias/
router.get('/', async (req, res) => {

    const busca = req.query.busca || ''
    const ordenar = req.query.ordenar || 'nome_categoria'
    const pg = req.query.pg || 1  //obtendo a pagina de dados - paginação 

    const limite = 10  //numero de registros por pagina
    const offset = (pg - 1) * limite  //quantidade de registros que quero "pular"

    const buscaDados = await BD.query(`SELECT * FROM categorias where upper(nome_categoria) like $1
            order by ${ordenar}`, [`%${busca.toUpperCase()}%`])


    const totalItens = await BD.query(`
            select count(*) as total 
            from categorias
            where upper(categorias.nome_categoria) like $1 
            `, [`%${busca.toUpperCase()}%`])

    const totalPgs = Math.ceil(totalItens.rows[0].total / limite)

    res.render("categoriasTelas/lista", {
        categorias: buscaDados.rows,
        busca: busca,
        ordenar: ordenar,
        pgAtual: parseInt(pg),
        totalPgs: totalPgs
    })

})

//Rota para abrir tela para criar uma nova categoria (C - Create)
router.get('/novo', (req, res,) => {
    res.render('categoriasTelas/criar')
})

router.post('/novo', async (req, res) => {
    const { nome_categoria } = req.body
    await BD.query('insert into categorias (nome_categoria) values ($1)', [nome_categoria])
    res.redirect('/categorias')
})

//Excluindo uma categoria (D - Delete)
router.post('/:id/deletar', async (req, res) => {
    const { id } = req.params
    //const  id = req.params.id
    await BD.query('delete from categorias where id_categoria = $1', [id])
    res.redirect('/categorias')
})

//Editando categorias (U - update) 
router.get('/:id/editar', async (req, res) => {
    const { id } = req.params
    //const id = req.params.id 
    const resultado = await BD.query('select * from categorias where id_categoria = $1', [id])
    res.render('categoriasTelas/editar', { categorias: resultado.rows[0] })
})

router.post('/:id/editar', async (req, res) => {
    const { id } = req.params
    const { nome_categoria } = req.body
    await BD.query('update categorias set nome_categoria = $1 where id_categoria = $2', [nome_categoria, id])
    res.redirect('/categorias')
})





module.exports = router 