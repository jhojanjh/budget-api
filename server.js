import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: 'budget-db',
  })
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error MongoDB:', err.message));

// Schema y modelo
const budgetSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    gastos: { type: Array, default: [] },
    aportes: { type: Array, default: [] }
  },
  { timestamps: true }
);

const Budget = mongoose.model('Budget', budgetSchema);

// Datos iniciales por defecto
const DEFAULT_GASTOS = [
  { id: 1, nombre: 'Arriendo Diciembre', categoria: 'Arriendo', monto: 720000, mes: 'Diciembre', pagado: false, recurrente: true },
  { id: 2, nombre: 'Arriendo Enero', categoria: 'Arriendo', monto: 720000, mes: 'Enero', pagado: false, recurrente: true },
  { id: 3, nombre: 'Arriendo Febrero', categoria: 'Arriendo', monto: 720000, mes: 'Febrero', pagado: false, recurrente: true },
  { id: 4, nombre: 'Internet LU', categoria: 'Servicios', monto: 525000, mes: 'Diciembre', pagado: false, recurrente: true },
  { id: 5, nombre: 'Internet JN', categoria: 'Servicios', monto: 80000, mes: 'Diciembre', pagado: false, recurrente: true },
  { id: 6, nombre: 'Luz', categoria: 'Servicios', monto: 380000, mes: 'Diciembre', pagado: false, recurrente: true },
  { id: 7, nombre: 'Agua', categoria: 'Servicios', monto: 388000, mes: 'Diciembre', pagado: false, recurrente: true },
  { id: 8, nombre: 'Celula', categoria: 'Servicios', monto: 285000, mes: 'Diciembre', pagado: false, recurrente: true }
];

const DEFAULT_APORTES = [
  { id: 1, persona: 'Jhojan', monto: 0, mes: 'Diciembre' },
  { id: 2, persona: 'Luisa ❤️', monto: 0, mes: 'Diciembre' },
];


// GET: obtener datos
app.get('/api/budget/:key', async (req, res) => {
  const { key } = req.params;

  try {
    let budget = await Budget.findOne({ key });

    // Si no existe, lo creamos con valores por defecto
    if (!budget) {
      budget = await Budget.create({
        key,
        gastos: DEFAULT_GASTOS,
        aportes: DEFAULT_APORTES,
      });
    }

    res.json({
      gastos: budget.gastos,
      aportes: budget.aportes,
      updatedAt: budget.updatedAt,
    });
  } catch (error) {
    console.error('Error GET:', error);
    res.status(500).json({ error: 'Error al obtener el presupuesto' });
  }
});

// PUT: actualizar datos
app.put('/api/budget/:key', async (req, res) => {
  const { key } = req.params;
  const { gastos, aportes } = req.body;

  try {
    const budget = await Budget.findOneAndUpdate(
      { key },
      { gastos, aportes },
      { new: true, upsert: true }
    );

    res.json({
      gastos: budget.gastos,
      aportes: budget.aportes,
      updatedAt: budget.updatedAt,
    });
  } catch (error) {
    console.error('Error PUT:', error);
    res.status(500).json({ error: 'Error al guardar el presupuesto' });
  }
});

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
