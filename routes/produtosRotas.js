const express = require('express')
const router = express.Router()
const BD = require('../db')
const { put, del } = require("@vercel/blob");

//Listar produtos (R - read)
//Para acessar essa rota digito /produtos/
router.get('/', async (req, res) => {
    const busca = req.query.busca || ''
    const ordenar = req.query.ordenar || 'nome_produto'
    const pg = req.query.pg || 1  //obtendo a pagina de dados - paginação 

    const limite = 10  //numero de registros por pagina
    const offset = (pg - 1) * limite  //quantidade de registros que quero "pular"

    const buscaDados = await BD.query(`select p.id_produto, p.nome_produto, p.estoque, p.estoque_minimo, p.valor, p.imagem, p.id_categoria, categorias.nome_categoria 
        from produtos p left join categorias on p.id_categoria = categorias.id_categoria 
        where upper(p.nome_produto) like $1 or upper(categorias.nome_categoria) like $1 
        order by ${ordenar}
        limit $2 offset $3`, [`%${busca.toUpperCase()}%`, limite, offset])
    

    const totalItens = await BD.query(`
        select count(*) as total 
        from produtos p left join categorias on p.id_categoria = categorias.id_categoria 
        where upper(p.nome_produto) like $1 or upper(categorias.nome_categoria) like $1 
        `, [`%${busca.toUpperCase()}%`])

    const totalPgs = Math.ceil(totalItens.rows[0].total / limite)

       res.render("produtosTelas/lista", {
         produtos: buscaDados.rows,
         busca: busca,
         ordenar: ordenar,
         pgAtual : parseInt(pg),
         totalPgs : totalPgs
     })
})





//Rota para criar um novo produto (c - Create)
//Para acessar /produtos/novo
router.get("/novo", async (req, res) => {
    try {
        const resultado = await BD.query('select * from categorias order by nome_categoria')
        res.render("produtosTelas/criar", { categoriaCadastrados: resultado.rows });

    } catch (erro) {
        console.log('Erro ao abrir tela de cadastro de produtos', erro)
        res.render('produtosTelas/criar', { mensagem: erro })
    }
});

router.post("/novo", async (req, res) => {
    try {
      const nome_produto = req.body.nome_produto;
      const estoque = req.body.estoque;
      const estoque_minimo = req.body.estoque_minimo;
      const valor = req.body.valor;
      const id_categoria = req.body.id_categoria;

      //

      const urlImagem = await enviarFoto(req.files.file);

      await BD.query(
        "insert into produtos (nome_produto,estoque,estoque_minimo,valor,imagem, id_categoria) values($1,$2,$3,$4,$5,$6)",
        [nome_produto,estoque,estoque_minimo,valor,urlImagem, id_categoria]
      );
      res.redirect('/produtos')
    } catch (erro) {
      console.log("erro ao cadastrar produto", erro);
      res.render("produtosTelas/criar", { mensagem: erro });
    }

  
  });




//Excluindo um produto (D - Delete)
//Para acessar /produtos/1/deletar
router.post('/:id/deletar', async (req, res) => {
    const { id } = req.params
    //const id = req.params.id
    await BD.query('delete from movimentacoes where id_produto = $1', [id])
    
    await BD.query('delete from produtos where id_produto = $1', [id])
    res.redirect('/produtos')
})

//Editar um produto (U - Update)
//Para acessar /produtos/1/editar
router.get('/:id/editar', async(req, res) => {
    const { id } = req.params
    //const { id } = req.params.id
    const resultado = await BD.query('select * from produtos where id_produto = $1', [id])
    const categoriaCadastrados= await BD.query ('select * from categorias order by nome_categoria')
    const Movimentacoes = await BD.query ("select *, TO_CHAR(data_movimentacao, 'DD/MM/YYYY') as data from movimentacoes where id_produto = $1", [id] )
    res.render('produtosTelas/editar', {
        produtos: resultado.rows[0],
        categoriaCadastrados:categoriaCadastrados.rows,
        Movimentacoes: Movimentacoes.rows})
})



router.post('/:id/editar', async (req, res) => {
    const { id } = req.params 
    const { nome_produto, valor, id_categoria, estoque, estoque_minimo, foto_produto } = req.body 

    let urlImagem = foto_produto
    if (req.files) {
        excluirFoto(urlImagem)
        urlImagem = await enviarFoto(req.files.file)
    }
    await BD.query(`update produtos set nome_produto =$1, valor = $2,  id_categoria = $3,
        estoque = $4, estoque_minimo = $5, imagem= $6 where id_produto = $7`, [nome_produto, valor , id_categoria, estoque, estoque_minimo, urlImagem, id])
        res.redirect('/produtos')
})

router.post('/:id/lancar-movimentacao', async (req, res) => {
    const { id } = req.params
    const { tipo_movimentacao, quantidade, descricao } = req.body 
    await BD.query(`insert into movimentacoes (tipo_movimentacao, quantidade, descricao, id_produto, data_movimentacao) values 
                        ($1, $2, $3, $4, current_date)`, [tipo_movimentacao, quantidade, descricao, id])
        res.redirect('/produtos')
})



const enviarFoto = async (file) => {
    const fileBuffer = file.data
    const originalName = file.name
    const blob = await put(originalName, fileBuffer, {
        access: "public", // Define acesso público ao arquivo
    });
    console.log(`Arquivo enviado com sucesso! URL: ${blob.url}`);
    return blob.url;
};

const excluirFoto = async (imagemUrl) => {
    const nomeArquivo = imagemUrl.split("/").pop();
    if (nomeArquivo) {
        await del(nomeArquivo);
        console.log(`Arquivo ${nomeArquivo} excluído com sucesso.`);
    }
}
module.exports = router 