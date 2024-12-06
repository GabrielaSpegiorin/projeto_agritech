const express = require('express')
const router = express.Router()
const BD = require('../db')

//Rota principal do Painel Administrativo
router.get('/', async (req, res) => {
    const qCategorias = await BD.query(`select count (*) as total_categoria from categorias`)
    const qProdutos = await BD.query(`select count (*) as total_produto from produtos`)
    const qEstoqueCategoria = await BD.query(`select c.nome_categoria, sum(p.estoque * p.valor)
                                                from categorias as c 
                                                    inner join produtos as p on c.id_categoria = p.id_categoria
                                                group by c.nome_categoria`)
     const qEstoqueProdutosAB = await BD.query(`select count (*) as total_produto from produtos where estoque < estoque_minimo`)

     const qEstoqueProdutosAC = await BD.query(`select count (*) as total_produto from produtos where estoque >= estoque_minimo`)
     
     const qEstoqueProduto = await BD.query(`select p.nome_produto, p.estoque
                                                from produtos as p`)
    
    
    res.render('admin/dashboard', {
        totalCategorias: qCategorias.rows[0].total_categoria,
        totalProdutos: qProdutos.rows[0].total_produto,
        estoqueCategoria: qEstoqueCategoria.rows,
        estoqueABmin: qEstoqueProdutosAB.rows[0].total_produto,
        estoqueACmin: qEstoqueProdutosAC.rows[0].total_produto,
        estoqueProduto: qEstoqueProduto.rows,
        
    })
})




module.exports = router