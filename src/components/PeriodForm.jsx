import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { ArrowLeft, Calendar } from 'lucide-react'
import { format } from 'date-fns'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function PeriodForm({ token }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    flow_intensity: '',
    symptoms: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      flow_intensity: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        start_date: formData.start_date,
        flow_intensity: formData.flow_intensity || null,
        symptoms: formData.symptoms || null
      }

      // Only include end_date if it's provided
      if (formData.end_date) {
        submitData.end_date = formData.end_date
      }

      const response = await fetch(`${API_BASE_URL}/periods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (response.ok) {
        alert('Period added successfully!')
        navigate('/')
      } else {
        alert(data.error || 'Failed to add period')
      }
    } catch (error) {
      console.error('Error adding period:', error)
      alert('Failed to add period. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Add Period</h1>
        <p className="text-gray-600">Record your menstrual cycle information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-red-500" />
            Period Information
          </CardTitle>
          <CardDescription>
            Enter the details of your menstrual period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date (optional)</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  min={formData.start_date}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flow_intensity">Flow Intensity</Label>
              <Select onValueChange={handleSelectChange} value={formData.flow_intensity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select flow intensity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms (optional)</Label>
              <Textarea
                id="symptoms"
                name="symptoms"
                placeholder="Describe any symptoms you experienced (cramps, headaches, mood changes, etc.)"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding Period...' : 'Add Period'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Tips for Accurate Tracking</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="space-y-2">
            <li>• Record your period start date as soon as it begins</li>
            <li>• Update the end date when your period completely stops</li>
            <li>• Track flow intensity to identify patterns</li>
            <li>• Note any symptoms to discuss with your healthcare provider</li>
            <li>• Consistent tracking improves prediction accuracy</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default PeriodForm

