import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import { languageRouter } from '#routes/language';
import { beansRouter } from '#routes/beans';

const PORT = process.env.PORT

// обрабатывает боди
const bodyJsonMiddleWare = express.json({
    type: () => true
})

const app = express()

app.use(cors());
app.use(bodyJsonMiddleWare);
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('./server/dist'));
app.use('/api/i18n', languageRouter);
app.use('/api/beans', beansRouter)

app.get('/',async () => {
    console.log('hello');
  // res.sendFile('./index.html', { root: './server/dist' } );
})

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
