import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { ArrowLeft, Droplets, Thermometer } from 'lucide-react'
import { format } from 'date-fns'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

function OvulationForm({ token }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    ovulation_date: format(new Date(), 'yyyy-MM-dd'),
    basal_body_temperature: '',
    cervical_mucus: '',
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
      cervical_mucus: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ovulation_date: formData.ovulation_date,
        basal_body_temperature: formData.basal_body_temperature ? parseFloat(formData.basal_body_temperature) : null,
        cervical_mucus: formData.cervical_mucus || null,
        symptoms: formData.symptoms || null
      }

      const response = await fetch(`${API_BASE_URL}/ovulation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (response.ok) {
        alert('Ovulation data added successfully!')
        navigate('/')
      } else {
        alert(data.error || 'Failed to add ovulation data')
      }
    } catch (error) {
      console.error('Error adding ovulation data:', error)
      alert('Failed to add ovulation data. Please try again.')
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
        <h1 className="text-3xl font-bold text-gray-900">Add Ovulation Data</h1>
        <p className="text-gray-600">Track your ovulation signs and symptoms</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Droplets className="h-5 w-5 mr-2 text-blue-500" />
            Ovulation Information
          </CardTitle>
          <CardDescription>
            Record ovulation signs to improve cycle predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ovulation_date">Ovulation Date *</Label>
              <Input
                id="ovulation_date"
                name="ovulation_date"
                type="date"
                required
                value={formData.ovulation_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basal_body_temperature">
                <Thermometer className="h-4 w-4 inline mr-1" />
                Basal Body Temperature (°F)
              </Label>
              <Input
                id="basal_body_temperature"
                name="basal_body_temperature"
                type="number"
                step="0.1"
                min="95"
                max="105"
                placeholder="e.g., 98.6"
                value={formData.basal_body_temperature}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500">
                Take your temperature first thing in the morning before getting out of bed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cervical_mucus">Cervical Mucus</Label>
              <Select onValueChange={handleSelectChange} value={formData.cervical_mucus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cervical mucus type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dry">Dry</SelectItem>
                  <SelectItem value="sticky">Sticky</SelectItem>
                  <SelectItem value="creamy">Creamy</SelectItem>
                  <SelectItem value="watery">Watery</SelectItem>
                  <SelectItem value="egg-white">Egg White (most fertile)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Egg white consistency indicates peak fertility
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Ovulation Symptoms (optional)</Label>
              <Textarea
                id="symptoms"
                name="symptoms"
                placeholder="Describe any ovulation symptoms (ovulation pain, breast tenderness, increased libido, etc.)"
                value={formData.symptoms}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding Ovulation Data...' : 'Add Ovulation Data'}
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
          <CardTitle className="text-sm">Ovulation Tracking Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          <ul className="space-y-2">
            <li>• Ovulation typically occurs 12-16 days before your next period</li>
            <li>• Basal body temperature rises 0.5-1°F after ovulation</li>
            <li>• Cervical mucus becomes clear and stretchy around ovulation</li>
            <li>• Some women experience mild pain on one side during ovulation</li>
            <li>• Track multiple signs for more accurate ovulation detection</li>
            <li>• Consider using ovulation predictor kits for additional confirmation</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default OvulationForm

