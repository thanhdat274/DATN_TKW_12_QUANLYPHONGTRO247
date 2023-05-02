import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
const expressValidator = require('express-validator');

require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('./routes/user.route');
const authRoutes = require('./routes/auth.route');
const houseRouter = require('./routes/house.route');
const roomRouter = require('./routes/room.route');
const serviceRouter = require('./routes/service.route');
const billServiceRouter = require('./routes/billService.route');
const billRouter = require('./routes/bill.route');
const statisticalRouter = require('./routes/statistical.route');
const bookingRouter = require('./routes/booking.route');
const paymentRouter = require('./routes/payment.route');
const reportRouter = require('./routes/report.route');
const historyRouter = require('./routes/history.route');
const BillLiquidationRoutes = require('./routes/billLiquidation.router');

const mongoString = process.env.DATABASE_URL;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
  console.log(error);
});

database.once('connected', () => {
  console.log('Database Connected');
});
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());

app.use(express.json({ limit: '20mb' }));

app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', houseRouter);
app.use('/api', roomRouter);
app.use('/api', serviceRouter);
app.use('/api/', billServiceRouter);
app.use('/api/', billRouter);
app.use('/api', statisticalRouter);
app.use('/api', bookingRouter);
app.use('/api', paymentRouter);
app.use('/api', reportRouter);
app.use('/api', historyRouter);
app.use('/api', BillLiquidationRoutes);

app.listen(8800, () => {
  console.log(`Server Started at ${8800}`);
});
