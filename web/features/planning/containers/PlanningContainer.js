import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useQuery, useQueryCache, useMutation } from 'react-query'

import {
  FullHeightContent,
  Button,
  Avatar,
  Spacer,
  Heading,
  Paragraph,
  AddButton,
} from '@glrodasz/components'

import TaskList from '../components/TaskList'

import tasks from '../api'
import { reorderTasks } from '../helpers'

const PlanningContainer = ({ initialData }) => {
  const [shouldStart, setShouldStart] = useState(false)
  const cache = useQueryCache()
  const { isLoading, error, data } = useQuery('tasks', () => tasks.getAll(), {
    initialData,
  })

  const [addTask] = useMutation((params) => tasks.create(params), {
    onSuccess: () => {
      // Query Invalidations
      cache.invalidateQueries('tasks')
    },
  })

  const [updatePriorities] = useMutation(
    (params) => tasks.updatePriorities(params),
    {
      onSuccess: () => {
        // Query Invalidations
        cache.invalidateQueries('tasks')
      },
    }
  )

  const [deleteTask] = useMutation((params) => tasks.delete(params), {
    onSuccess: () => {
      // Query Invalidations
      cache.invalidateQueries('tasks')
    },
  })

  useEffect(() => {
    if (data?.length >= 1) {
      setShouldStart(true)
    } else {
      setShouldStart(false)
    }
  }, [data])

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return
    }

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    const orderedTasks = reorderTasks(data, sourceIndex, destinationIndex)

    updatePriorities({ tasks: orderedTasks })
  }

  if (isLoading) return 'Loading...'
  if (error) return `An error has ocurred ${error.message}`

  return (
    <>
      <FullHeightContent
        content={
          <>
            <div className="user-header">
              <Avatar src="https://placeimg.com/200/200/people" />
              <Spacer.Vertical size="sm" />
              <div className="text">
                <Heading size="lg">Hola, Cristian</Heading>
                <Paragraph size="lg">Conoce la metodologia RETO</Paragraph>
              </div>
            </div>
            <Spacer.Horizontal size="lg" />
            <Heading size="lg">
              Ahora dime, ¿cuál es la primera tarea en la que trabajarás hoy?
            </Heading>
            <Spacer.Horizontal size="md" />
            <TaskList
              tasks={data}
              onDragEnd={onDragEnd}
              onDeleteTask={deleteTask}
            />
            <Spacer.Horizontal size="md" />
            <AddButton
              onAdd={(value) =>
                addTask({ description: value, priority: data.length })
              }
              focusHelpText="Presiona enter"
              blurHelpText="Clic para continuar"
            >
              Toca para agregar la tarea
            </AddButton>
          </>
        }
        footer={
          shouldStart ? (
            <>
              <Spacer.Horizontal size="lg" />
              <Paragraph size="sm">
                Basados en la matriz de Eisenhower priorizamos tus tareas
                evitando listas de pendientes saturadas.
              </Paragraph>
              <Spacer.Horizontal size="sm" />
              <Button isDisabled type="primary">
                Empieza ahora
              </Button>
            </>
          ) : null
        }
      />
      <style jsx>{`
        .user-header {
          display: flex;
        }

        .text {
          flex-direction: column;
          align-items: flex-start;
          display: flex;
        }
      `}</style>
    </>
  )
}

PlanningContainer.propTypes = {
  initialData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      priority: PropTypes.number.isRequired,
    })
  ),
}

export default PlanningContainer
