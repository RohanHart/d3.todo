'use strict';

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    factory(module.exports, require('d3'))
  } else {
    factory(root, root.d3)
  }
}(this, function (exports, d3) {
  // rename the base d3 abstraction!
  d3.selection.prototype.with = d3.selection.prototype.call

  function todoWidget (config) {
    var items = []
    var uid = 0
    var todoLines

    (function () {
      var container = d3.select(config.container)

      container.with(addButtonFor(
        inputBox(container)))

      todoLines = todoList(container)

      return this

      function inputBox (container) {
        return container.select('#input')
          .on('keypress', function () {
            if (d3.event.which === 13) {
              addItem(this.value)
            }
          })
      }

      function addButtonFor (input) {
        return function addButton (container) {
          return container.select('#add')
            .on('click', function () {
              addItem(input.property('value'))
            })
        }
      }

      function todoList (container) {
        return container.select('#list')
          .selectAll('*')  // will replace all the existing nodes
      }

      function addItem (itemText) {
        items.push({
          label: itemText,
          isDone: false,
          uid: uid++
        })
        renderList()

        return this
      }
    })()

    function renderList () {
      var binding = todoLines.data(items, function (d) {
        return d ? d.uid : d  // d will not be bound if the node was not created by d3 which is the case for the templated <li>
      })

      var newTodoLines = todoLine(binding.enter())

      todoLines = binding.merge(newTodoLines)
        .classed('done', function (d) {
          return d.isDone
        })

      binding.exit().remove()

      return this

      function todoLine (container) {
        return container.append('li')
          .attr('class', 'item')
          .with(doneToggle)
          .with(label)
          .with(removeButton)

        function doneToggle (line) {
          return line.append('input')
            .attr('type', 'checkbox')
            .attr('class', 'state-button')
            .on('click', setItemState)

          function setItemState (item) {
            item.isDone = !item.isDone
            renderList()

            return this
          }
        }

        function label (line) {
          return line.append('span')
            .attr('class', 'label')
            .text(function (d) {
              return d.label
            })
        }

        function removeButton (line) {
          return line.append('span')
            .attr('class', 'delete-button')
            .html('&#10060')
            .on('click', removeItem)

          function removeItem (item) {
            items = items.filter(function (d) {
              return d.uid !== item.uid
            })
            renderList()

            return this
          }
        }
      }
    }

    function setItems (_items) {
      items = _items.map(function (d) {
        return {
          label: d,
          isDone: false,
          uid: uid++
        }
      })
      renderList()

      return this
    }

    return {
      setItems: setItems
    }
  }

  exports.todoWidget = todoWidget
}))
