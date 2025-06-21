import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Calendar, Plus, TrendingUp, Heart, Droplets, Thermometer } from 'lucide-react'
import { format, parseISO, addDays, differenceInDays } from 'date-fns'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
function Dashboard({ token }) {
  const [periods, setPeriods] = useState([])
  const [ovulations, setOvulations] = useState([])
  const [predictions, setPredictions] = useState({})
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const headers = {
        'Authorization': `Bearer ${token}`
      }

      // Fetch periods
      const periodsResponse = await fetch(`${API_BASE_URL}/periods`, { headers })
      if (periodsResponse.ok) {
        const periodsData = await periodsResponse.json()
        setPeriods(periodsData)
      }

      // Fetch ovulations
      const ovulationsResponse = await fetch(`${API_BASE_URL}/ovulation`, { headers })
      if (ovulationsResponse.ok) {
        const ovulationsData = await ovulationsResponse.json()
        setOvulations(ovulationsData)
      }

      // Fetch predictions
      const periodPredictionResponse = await fetch(`${API_BASE_URL}/predict/period`, { headers })
      const ovulationPredictionResponse = await fetch(`${API_BASE_URL}/predict/ovulation`, { headers })
      
      const predictions = {}
      if (periodPredictionResponse.ok) {
        predictions.period = await periodPredictionResponse.json()
      }
      if (ovulationPredictionResponse.ok) {
        predictions.ovulation = await ovulationPredictionResponse.json()
      }
      setPredictions(predictions)

      // Fetch cycle stats
      const statsResponse = await fetch(`${API_BASE_URL}/cycle-stats`, { headers })
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysUntil = (dateString) => {
    if (!dateString) return null
    const targetDate = parseISO(dateString)
    const today = new Date()
    return differenceInDays(targetDate, today)
  }

  const getPhaseInfo = () => {
    const today = new Date()
    const lastPeriod = periods[0]
    
    if (!lastPeriod) return { phase: 'Unknown', description: 'Add your first period to get started' }
    
    const lastPeriodDate = parseISO(lastPeriod.start_date)
    const daysSinceLastPeriod = differenceInDays(today, lastPeriodDate)
    
    if (daysSinceLastPeriod <= 7) {
      return { phase: 'Menstrual', description: 'Your period is currently active or just ended' }
    } else if (daysSinceLastPeriod <= 14) {
      return { phase: 'Follicular', description: 'Your body is preparing for ovulation' }
    } else if (daysSinceLastPeriod <= 21) {
      return { phase: 'Ovulation', description: 'You may be ovulating or in your fertile window' }
    } else {
      return { phase: 'Luteal', description: 'Your body is preparing for your next period' }
    }
  }

  const phaseInfo = getPhaseInfo()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      p
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Track your menstrual cycle and health</p>
        </div>
        <div className="flex space-x-2">
          <Link to="/add-period">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Period
            </Button>
          </Link>
          <Link to="/add-ovulation">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Ovulation
            </Button>
          </Link>
        </div>
      </div>

      {/* Current Phase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="h-5 w-5 mr-2 text-pink-500" />
            Current Phase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {phaseInfo.phase}
              </Badge>
              <p className="text-gray-600 mt-2">{phaseInfo.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-red-500" />
              Next Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictions.period?.predicted_date ? (
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {format(parseISO(predictions.period.predicted_date), 'MMM dd, yyyy')}
                </p>
                <p className="text-gray-600">
                  {getDaysUntil(predictions.period.predicted_date) > 0 
                    ? `In ${getDaysUntil(predictions.period.predicted_date)} days`
                    : 'Expected now or overdue'
                  }
                </p>
                <Badge variant="outline" className="mt-2">
                  {predictions.period.confidence} confidence
                </Badge>
              </div>
            ) : (
              <p className="text-gray-500">Add more period data for predictions</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-blue-500" />
              Next Ovulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {predictions.ovulation?.predicted_date ? (
              <div>
                <p className="text-2xl font-bold text-blue-500">
                  {format(parseISO(predictions.ovulation.predicted_date), 'MMM dd, yyyy')}
                </p>
                <p className="text-gray-600">
                  {getDaysUntil(predictions.ovulation.predicted_date) > 0 
                    ? `In ${getDaysUntil(predictions.ovulation.predicted_date)} days`
                    : 'Expected now or passed'
                  }
                </p>
                <Badge variant="outline" className="mt-2">
                  {predictions.ovulation.confidence} confidence
                </Badge>
              </div>
            ) : (
              <p className="text-gray-500">Add period data for ovulation predictions</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cycle Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Cycle Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats.average_cycle_length || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Avg Cycle Length</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats.average_period_length || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Avg Period Length</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats.total_periods || 0}
              </p>
              <p className="text-sm text-gray-600">Total Periods</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {stats.cycle_regularity || 'Unknown'}
              </p>
              <p className="text-sm text-gray-600">Regularity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Periods</CardTitle>
          </CardHeader>
          <CardContent>
            {periods.length > 0 ? (
              <div className="space-y-3">
                {periods.slice(0, 5).map((period) => (
                  <div key={period.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {format(parseISO(period.start_date), 'MMM dd, yyyy')}
                        {period.end_date && ` - ${format(parseISO(period.end_date), 'MMM dd')}`}
                      </p>
                      {period.flow_intensity && (
                        <Badge variant="outline" className="mt-1">
                          {period.flow_intensity} flow
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No periods recorded yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Ovulation</CardTitle>
          </CardHeader>
          <CardContent>
            {ovulations.length > 0 ? (
              <div className="space-y-3">
                {ovulations.slice(0, 5).map((ovulation) => (
                  <div key={ovulation.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {format(parseISO(ovulation.ovulation_date), 'MMM dd, yyyy')}
                      </p>
                      <div className="flex space-x-2 mt-1">
                        {ovulation.basal_body_temperature && (
                          <Badge variant="outline">
                            <Thermometer className="h-3 w-3 mr-1" />
                            {ovulation.basal_body_temperature}°F
                          </Badge>
                        )}
                        {ovulation.cervical_mucus && (
                          <Badge variant="outline">
                            {ovulation.cervical_mucus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No ovulation data recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard

